import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { SantraLogo } from "@/components/SantraLogo";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/santra-chat`;

const emergencyKeywords = ["chest pain", "can't breathe", "severe bleeding", "unconscious", "heart attack", "stroke", "suicide", "overdose"];

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { profile, signOut } = useAuth();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    deleteConversation,
    loading,
  } = useConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping, streamingContent]);

  const handleNewChat = async () => {
    await createConversation("New Conversation");
    setShowEmergency(false);
    setSidebarOpen(false);
  };

  const streamChat = useCallback(async (
    messages: { role: string; content: string }[],
    conversationHistory: { role: string; content: string }[],
    onDelta: (delta: string) => void,
    onDone: () => void
  ) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, conversationHistory }),
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

    // Final flush
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

    onDone();
  }, []);

  const handleSendMessage = async (content: string) => {
    let conversationId = activeConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = await createConversation(content.slice(0, 30) + (content.length > 30 ? "..." : ""));
      if (!conversationId) return;
    }

    // Add user message
    await addMessage(conversationId, content, "user");

    // Check for emergency keywords
    const isEmergency = emergencyKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword)
    );

    setIsTyping(true);
    setStreamingContent("");

    // Build conversation history for context
    const conversationHistory = (activeConversation?.messages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let fullResponse = "";

    try {
      await streamChat(
        [{ role: "user", content }],
        conversationHistory,
        (delta) => {
          fullResponse += delta;
          setStreamingContent(fullResponse);
        },
        async () => {
          setIsTyping(false);
          setStreamingContent("");
          
          // Check if response indicates emergency
          const responseIsEmergency = isEmergency || fullResponse.toUpperCase().startsWith("EMERGENCY:");
          
          // Save the complete response
          await addMessage(conversationId!, fullResponse, "assistant", responseIsEmergency);
          setShowEmergency(responseIsEmergency);
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setStreamingContent("");
    }
  };

  const handleConsultDoctor = () => {
    window.open("https://prescribly.app", "_blank");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-50 h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId || undefined}
          onNewChat={handleNewChat}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setShowEmergency(false);
            setSidebarOpen(false);
          }}
          onDeleteConversation={deleteConversation}
          onConsultDoctor={handleConsultDoctor}
          onSignOut={handleSignOut}
          userName={profile?.full_name || "User"}
        />
      </div>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="md:hidden">
              <SantraLogo size="sm" />
            </div>
            <h1 className="hidden md:block font-semibold text-foreground">
              {activeConversation?.title || "New Chat"}
            </h1>
          </div>
          <Button variant="santra-ghost" size="sm" onClick={handleConsultDoctor}>
            Consult a Doctor
          </Button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 santra-gradient rounded-3xl flex items-center justify-center mb-6 shadow-santra animate-float">
                <SantraLogo size="lg" showText={false} />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Ask me any health question — from symptoms and conditions to wellness tips 
                and medication information.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  "What are common cold symptoms?",
                  "How to improve sleep quality?",
                  "Signs of dehydration",
                  "Tips for managing stress",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left p-4 bg-accent hover:bg-accent/80 rounded-xl text-sm text-foreground transition-colors border border-border hover:border-primary/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto p-4 space-y-6">
              {activeConversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {/* Streaming message */}
              {isTyping && streamingContent && (
                <ChatMessage
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingContent,
                    isEmergency: false,
                    timestamp: new Date(),
                  }}
                />
              )}
              {isTyping && !streamingContent && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Emergency Banner */}
        {showEmergency && <EmergencyBanner onConsultDoctor={handleConsultDoctor} />}

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </div>
        </div>
      </main>
    </div>
  );
}
