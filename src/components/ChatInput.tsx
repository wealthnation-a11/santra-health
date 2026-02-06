import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { UploadMenu } from "./UploadMenu";
import { PremiumUploadModal } from "./PremiumUploadModal";
import { VoiceInputButton } from "./VoiceInputButton";
import { VoiceLanguageSelector } from "./VoiceLanguageSelector";
import { StopGenerationButton } from "./StopGenerationButton";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isGenerating = false,
  placeholder = "Ask Santra a health question...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Directly send the voice message
    onSend(transcript);
  }, [onSend]);

  const {
    isListening,
    isLoading: voiceLoading,
    canUseVoice,
    remainingUses,
    startListening,
    stopListening,
  } = useVoiceInput(handleVoiceTranscript, voiceLanguage);

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
        {/* Language selector row */}
        <div className="flex items-center justify-between mb-2">
          {/* Stop Generation Button */}
          <div>
            {isGenerating && onStop && (
              <StopGenerationButton onStop={onStop} />
            )}
          </div>
          
          <VoiceLanguageSelector
            value={voiceLanguage}
            onChange={setVoiceLanguage}
            disabled={disabled || isListening}
          />
        </div>
        
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
            <VoiceInputButton
              isListening={isListening}
              isLoading={voiceLoading}
              canUseVoice={canUseVoice}
              remainingUses={remainingUses}
              onStart={startListening}
              onStop={stopListening}
              disabled={disabled}
            />
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
