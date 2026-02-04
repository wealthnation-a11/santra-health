import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Mail, HelpCircle, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SantraLogo } from "@/components/SantraLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface SupportMessage {
  id: string;
  content: string;
  sender: "user" | "support";
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  "how to use": "Santra is simple to use! Just type your health question in the chat, and I'll provide helpful information. You can also use voice input by clicking the microphone button. Remember, Santra is for educational purposes only - always consult a doctor for medical advice.",
  "voice": "You can use voice input by clicking the microphone button in the chat. You have 10 free voice inputs per month. The feature supports multiple languages - just select your preferred language from the dropdown.",
  "account": "To manage your account, go to Settings (gear icon in the sidebar). There you can update your name, country, theme preferences, and notification settings.",
  "privacy": "Your privacy is important to us! All conversations are encrypted and stored securely. We never share your personal health information with third parties. You can delete your chat history at any time.",
  "emergency": "If you're experiencing a medical emergency, please call your local emergency services immediately. Santra is not a substitute for emergency medical care.",
  "doctor": "When Santra detects you might need professional help, a 'Consult a Doctor' button will appear. This will connect you with Prescribly for professional medical consultations.",
  "delete": "To delete a conversation, hover over it in the sidebar and click the trash icon. Confirm the deletion when prompted.",
  "default": "I'm here to help! If you have questions about using Santra, your account, privacy, or other topics, just ask. For complex issues, you can email us at santrahealthsupport@gmail.com"
};

function getSupportResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("how to use") || lowerMessage.includes("how do i use") || lowerMessage.includes("getting started")) {
    return FAQ_RESPONSES["how to use"];
  }
  if (lowerMessage.includes("voice") || lowerMessage.includes("microphone") || lowerMessage.includes("speak")) {
    return FAQ_RESPONSES["voice"];
  }
  if (lowerMessage.includes("account") || lowerMessage.includes("settings") || lowerMessage.includes("profile")) {
    return FAQ_RESPONSES["account"];
  }
  if (lowerMessage.includes("privacy") || lowerMessage.includes("data") || lowerMessage.includes("secure")) {
    return FAQ_RESPONSES["privacy"];
  }
  if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent")) {
    return FAQ_RESPONSES["emergency"];
  }
  if (lowerMessage.includes("doctor") || lowerMessage.includes("consult") || lowerMessage.includes("professional")) {
    return FAQ_RESPONSES["doctor"];
  }
  if (lowerMessage.includes("delete") || lowerMessage.includes("remove") || lowerMessage.includes("clear")) {
    return FAQ_RESPONSES["delete"];
  }
  
  return FAQ_RESPONSES["default"];
}

export default function Support() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: "welcome",
      content: `Hi${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}! 👋 Welcome to Santra Support. I'm here to help you with any questions about using Santra. What can I help you with today?`,
      sender: "support",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const userMessage: SupportMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getSupportResponse(inputMessage);
      const supportMessage: SupportMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const quickQuestions = [
    "How to use Santra?",
    "Voice input help",
    "Privacy & security",
    "Account settings",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
              <ArrowLeft size={20} />
            </Button>
            <SantraLogo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            <span className="font-semibold text-foreground">Help & Support</span>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto max-w-2xl flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "santra-gradient text-primary-foreground rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                {message.sender === "support" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 santra-gradient rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">S</span>
                    </div>
                    <span className="text-xs font-medium opacity-70">Santra Support</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-[10px] mt-1 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 santra-gradient rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-foreground">S</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Santra Support</span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInputMessage(question);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email Support Banner */}
        <div className="px-4 py-3 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">Need more help?</span>
            </div>
            <a
              href="mailto:santrahealthsupport@gmail.com"
              className="text-xs text-primary hover:underline font-medium"
            >
              Email us at santrahealthsupport@gmail.com
            </a>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 rounded-full"
            />
            <Button
              variant="santra"
              size="icon"
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              className="rounded-full"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
