import { User } from "lucide-react";
import { SantraLogo } from "./SantraLogo";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isEmergency?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <SantraLogo size="sm" showText={false} />
        </div>
      )}
      
      <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`px-4 py-3 ${
            isUser
              ? "bg-santra-chat-user rounded-2xl rounded-br-md text-foreground"
              : "bg-santra-chat-ai rounded-2xl rounded-bl-md text-foreground"
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className={`text-xs text-muted-foreground mt-1 block ${isUser ? "text-right" : "text-left"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
