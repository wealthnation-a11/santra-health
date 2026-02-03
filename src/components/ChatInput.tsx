import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { UploadMenu } from "./UploadMenu";
import { PremiumUploadModal } from "./PremiumUploadModal";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = "Ask Santra a health question..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-secondary/50 border border-border rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground px-3 py-2 min-h-[44px] max-h-[150px] scrollbar-thin"
          />
          <div className="flex items-center gap-1 pb-1">
            <UploadMenu 
              onSelectOption={() => setShowPremiumModal(true)} 
              disabled={disabled} 
            />
            <Button
              type="submit"
              variant="santra"
              size="icon"
              disabled={!message.trim() || disabled}
              className="rounded-xl"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Santra provides educational health information only. Not a substitute for professional medical advice.
        </p>
      </form>
      
      <PremiumUploadModal 
        open={showPremiumModal} 
        onOpenChange={setShowPremiumModal} 
      />
    </>
  );
}
