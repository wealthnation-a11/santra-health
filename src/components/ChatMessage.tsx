import { useState } from "react";
import { User } from "lucide-react";
import { SantraLogo } from "./SantraLogo";
import { ConsultDoctorButton } from "./ConsultDoctorButton";
import { MessageActions } from "./MessageActions";
import { EditMessageInput } from "./EditMessageInput";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isEmergency?: boolean;
}

interface ChatMessageProps {
  message: Message;
  showConsultButton?: boolean;
  isLastAssistant?: boolean;
  isLastUser?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  feedback?: "positive" | "negative" | null;
  onFeedbackChange?: (feedback: "positive" | "negative" | null) => void;
}

export function ChatMessage({
  message,
  showConsultButton = false,
  isLastAssistant = false,
  isLastUser = false,
  onRegenerate,
  onEdit,
  feedback,
  onFeedbackChange,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === "user";
  const isAI = message.role === "assistant";

  const handleSaveEdit = (newContent: string) => {
    setIsEditing(false);
    if (newContent !== message.content) {
      onEdit?.(newContent);
    }
  };

  if (isEditing && isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%] md:max-w-[70%] w-full">
          <EditMessageInput
            initialContent={message.content}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 animate-fade-in group ${isUser ? "justify-end" : "justify-start"}`}>
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
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-2 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          
          {/* Message Actions */}
          {message.id !== "streaming" && (
            <MessageActions
              messageId={message.id}
              content={message.content}
              role={message.role}
              isLastAssistant={isLastAssistant}
              isLastUser={isLastUser}
              onRegenerate={onRegenerate}
              onEdit={isUser && isLastUser ? () => setIsEditing(true) : undefined}
              feedback={feedback}
              onFeedbackChange={onFeedbackChange}
            />
          )}
          
          {isAI && showConsultButton && (
            <ConsultDoctorButton className="text-xs h-7 px-3" />
          )}
        </div>
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
