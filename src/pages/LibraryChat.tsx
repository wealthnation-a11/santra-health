import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Activity, Pill, TestTube, FileText, GraduationCap, Search, Info, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryConversations } from "@/hooks/useLibraryConversations";
import { getLibraryById } from "@/data/libraries";
import { findLastIndex } from "@/lib/arrayUtils";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/library-chat`;

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Heart,
  Activity,
  Pill,
  TestTube,
  FileText,
  GraduationCap,
  Search,
};

export default function LibraryChat() {
  const { libraryId } = useParams<{ libraryId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const library = libraryId ? getLibraryById(libraryId) : undefined;
  const IconComponent = library ? (iconMap[library.icon] || BookOpen) : BookOpen;

  const {
    activeConversation,
    createConversation,
    addMessage,
    loading,
  } = useLibraryConversations(libraryId || "");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping, streamingContent]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
      setStreamingContent("");
      toast.info("Generation stopped");
    }
  }, []);

  const streamChat = useCallback(async (
    messages: { role: string; content: string }[],
    conversationHistory: { role: string; content: string }[],
    systemPrompt: string,
    onDelta: (delta: string) => void,
    onDone: () => void,
    signal?: AbortSignal
  ) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, conversationHistory, systemPrompt, libraryId }),
      signal,
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
      } else if (resp.status === 402) {
        toast.error("Service temporarily unavailable. Please try again later.");
      } else {
        toast.error(errorData.error || "Failed to get response. Please try again.");
      }
      throw new Error(errorData.error || "Failed to start stream");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    try {
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }
    } finally {
      reader.releaseLock();
    }

    onDone();
  }, [libraryId]);

  const handleSendMessage = async (content: string) => {
    if (!library) return;

    let conversationId = activeConversation?.id;

    if (!conversationId) {
      conversationId = await createConversation(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
      if (!conversationId) return;
    }

    await addMessage(conversationId, content, "user");

    setIsTyping(true);
    setStreamingContent("");
    abortControllerRef.current = new AbortController();

    const conversationHistory = (activeConversation?.messages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let fullResponse = "";

    try {
      await streamChat(
        [{ role: "user", content }],
        conversationHistory,
        library.systemPrompt,
        (delta) => {
          fullResponse += delta;
          setStreamingContent(fullResponse);
        },
        async () => {
          setIsTyping(false);
          setStreamingContent("");
          abortControllerRef.current = null;
          await addMessage(conversationId!, fullResponse, "assistant");
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        if (fullResponse.trim()) {
          await addMessage(conversationId!, fullResponse + "\n\n*[Response stopped by user]*", "assistant");
        }
      } else {
        console.error("Library chat error:", error);
      }
      setIsTyping(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

  if (!library) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Library not found</h1>
          <Button onClick={() => navigate("/libraries")}>Back to Libraries</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen message={`Loading ${library.name}...`} />;
  }

  const allMessages = activeConversation?.messages || [];
  const lastAssistantIdx = findLastIndex(allMessages, (m) => m.role === "assistant");

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/libraries")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className={`p-2 rounded-lg ${library.color}`}>
            <IconComponent size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">
              {library.name}
            </h1>
            <p className="text-xs text-muted-foreground">Educational Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Library Context Banner */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Info size={14} className="text-primary" />
          <span>You are chatting inside: <span className="font-medium text-primary">{library.name}</span> (Educational Mode)</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {allMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${library.color}`}>
              <IconComponent size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              {library.name}
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              {library.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {getStarterQuestions(library.id).map((question) => (
                <button
                  key={question}
                  onClick={() => handleSendMessage(question)}
                  className="text-left p-4 bg-accent hover:bg-accent/80 rounded-xl text-sm text-foreground transition-colors border border-border hover:border-primary/30"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {allMessages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                showConsultButton={false}
                isLastAssistant={message.role === "assistant" && index === lastAssistantIdx && !isTyping}
                onSuggestionSelect={handleSendMessage}
                showSuggestions={message.role === "assistant" && index === lastAssistantIdx && !isTyping}
              />
            ))}
            {isTyping && streamingContent && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  isEmergency: false,
                  timestamp: new Date(),
                }}
                showConsultButton={false}
              />
            )}
            {isTyping && !streamingContent && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <div className="border-t border-border bg-muted/30 px-4 py-2">
        <p className="text-xs text-center text-muted-foreground">
          Santra provides health education only and does not replace professional medical advice.
        </p>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            onStop={handleStopGeneration}
            disabled={isTyping}
            isGenerating={isTyping}
            placeholder={`Ask about ${library.name.toLowerCase()}...`}
          />
        </div>
      </div>
    </div>
  );
}

function getStarterQuestions(libraryId: string): string[] {
  const starters: Record<string, string[]> = {
    "medical-dictionary": [
      "What does 'hypertension' mean?",
      "Define 'tachycardia'",
      "What is 'hemoglobin'?",
      "Explain 'antibiotics'",
    ],
    "anatomy-physiology": [
      "How does the heart pump blood?",
      "Explain the respiratory system",
      "What does the liver do?",
      "How do muscles work?",
    ],
    "diseases-conditions": [
      "What is diabetes?",
      "Explain asthma symptoms",
      "What causes hypertension?",
      "How is malaria spread?",
    ],
    "pharmacology": [
      "How do painkillers work?",
      "What are antibiotics?",
      "Explain drug interactions",
      "What is a beta-blocker?",
    ],
    "laboratory-tests": [
      "What does CBC measure?",
      "Explain blood glucose test",
      "What is a lipid panel?",
      "Normal hemoglobin range?",
    ],
    "clinical-cases": [
      "Give me a case on chest pain",
      "Present a diabetic case",
      "Pediatric fever case",
      "Hypertension case study",
    ],
    "study-prep": [
      "Mnemonics for cranial nerves",
      "Summarize the cardiac cycle",
      "Key points on diabetes",
      "Anatomy study tips",
    ],
    "research-evidence": [
      "What is a randomized trial?",
      "Explain p-values",
      "Types of bias in studies",
      "How to read a meta-analysis?",
    ],
  };
  return starters[libraryId] || [];
}
