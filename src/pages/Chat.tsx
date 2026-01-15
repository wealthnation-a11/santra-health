import { useState, useRef, useEffect } from "react";
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

// Mock AI responses for demo (will be replaced with real AI later)
const mockResponses = [
  "I understand you're concerned about that. While I can provide general health information, I want to remind you that for specific medical advice, it's always best to consult with a healthcare professional. Here's what I can share...",
  "That's a great question! Based on general health knowledge, I can explain that this is a common concern many people have. Let me break it down for you...",
  "Thank you for sharing that with me. From a general wellness perspective, there are several things you should know. However, please remember that I'm here to educate, not diagnose...",
  "I appreciate you asking about this. It's important to stay informed about health topics. Here's some educational information that might help you understand better...",
];

const emergencyKeywords = ["chest pain", "can't breathe", "severe bleeding", "unconscious", "heart attack", "stroke", "suicide", "overdose"];

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { profile, signOut } = useAuth();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    loading,
  } = useConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  const handleNewChat = async () => {
    await createConversation("New Conversation");
    setShowEmergency(false);
    setSidebarOpen(false);
  };

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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    const aiContent = isEmergency
      ? "I'm concerned about what you've shared. This sounds like it could be a serious situation that requires immediate medical attention. Please seek emergency care right away. While I can provide general health information, your safety is the priority here. If you're in immediate danger, please call emergency services (like 911 in the US, 999 in the UK, or your local emergency number)."
      : mockResponses[Math.floor(Math.random() * mockResponses.length)];

    // Add AI response
    await addMessage(conversationId, aiContent, "assistant", isEmergency);

    setIsTyping(false);
    setShowEmergency(isEmergency);
  };

  const handleConsultDoctor = () => {
    window.open("https://prescribly.com", "_blank");
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
              {isTyping && <TypingIndicator />}
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
