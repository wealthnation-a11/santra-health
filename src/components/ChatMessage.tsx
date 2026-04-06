import { useState } from "react";
import { BranchSelector } from "./BranchSelector";
import { User, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import { SantraLogo } from "./SantraLogo";
import { ConsultDoctorButton } from "./ConsultDoctorButton";
import { MessageActions } from "./MessageActions";
import { EditMessageInput } from "./EditMessageInput";
import { SuggestionChips, parseSuggestions } from "./SuggestionChips";
import ReactMarkdown from "react-markdown";
import { RichMarkdown } from "./RichMarkdown";

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
  onBranch?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  feedback?: "positive" | "negative" | null;
  onFeedbackChange?: (feedback: "positive" | "negative" | null) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  showSuggestions?: boolean;
  conversationId?: string;
  branchInfo?: { currentIndex: number; totalBranches: number; onNavigate: (dir: "prev" | "next") => void };
}

export function ChatMessage({
  message,
  showConsultButton = false,
  isLastAssistant = false,
  isLastUser = false,
  onRegenerate,
  onEdit,
  onBranch,
  onPin,
  isPinned = false,
  feedback,
  onFeedbackChange,
  onSuggestionSelect,
  showSuggestions = false,
  conversationId,
  branchInfo,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isUser = message.role === "user";
  const isAI = message.role === "assistant";
  
  // Parse suggestions from AI response
  const { cleanContent, suggestions } = isAI 
    ? parseSuggestions(message.content)
    : { cleanContent: message.content, suggestions: [] };

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
    <div className={`animate-fade-in group ${isUser ? "flex justify-end" : ""}`}>
      {/* AI messages: Claude-like full-width layout */}
      {isAI && (
        <div className="w-full">
          <div className="flex items-start gap-2.5 mb-1">
            <div className="flex-shrink-0 mt-0.5">
              <SantraLogo size="sm" showText={false} />
            </div>
            <span className="text-sm font-semibold text-foreground">Santra</span>
          </div>
          <div className="pl-0 md:pl-[34px]">
            <div className="py-1">
              <RichMarkdown content={cleanContent} />
            </div>
            
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              
              {branchInfo && branchInfo.totalBranches > 1 && (
                <BranchSelector
                  currentIndex={branchInfo.currentIndex}
                  totalBranches={branchInfo.totalBranches}
                  onNavigate={branchInfo.onNavigate}
                />
              )}
              
              {message.id !== "streaming" && (
                <MessageActions
                  messageId={message.id}
                  content={cleanContent}
                  role={message.role}
                  isLastAssistant={isLastAssistant}
                  isLastUser={isLastUser}
                  onRegenerate={onRegenerate}
                  onEdit={undefined}
                  onBranch={onBranch}
                  onPin={onPin}
                  isPinned={isPinned}
                  feedback={feedback}
                  onFeedbackChange={onFeedbackChange}
                  conversationId={conversationId}
                />
              )}
              
              {showConsultButton && (
                <ConsultDoctorButton className="text-xs h-7 px-3" />
              )}
            </div>
            
            {showSuggestions && suggestions.length > 0 && onSuggestionSelect && (
              <SuggestionChips 
                suggestions={suggestions} 
                onSelect={onSuggestionSelect} 
              />
            )}
          </div>
        </div>
      )}

      {/* User messages: right-aligned bubble */}
      {isUser && (
        <div className="max-w-[85%] md:max-w-[70%] inline-block">
          <div className="bg-santra-chat-user rounded-2xl rounded-br-md px-4 py-3 text-foreground">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{cleanContent}</p>
          </div>
          <div className="flex items-center gap-2 mt-1.5 justify-end">
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {message.id !== "streaming" && (
              <MessageActions
                messageId={message.id}
                content={cleanContent}
                role={message.role}
                isLastAssistant={false}
                isLastUser={isLastUser}
                onRegenerate={undefined}
                onEdit={isLastUser ? () => setIsEditing(true) : undefined}
                onBranch={undefined}
                onPin={undefined}
                isPinned={false}
                feedback={undefined}
                onFeedbackChange={undefined}
                conversationId={conversationId}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
