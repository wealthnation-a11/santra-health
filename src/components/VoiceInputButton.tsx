import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInputButtonProps {
  isListening: boolean;
  isLoading: boolean;
  canUseVoice: boolean;
  remainingUses: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceInputButton({
  isListening,
  isLoading,
  canUseVoice,
  remainingUses,
  onStart,
  onStop,
  disabled,
}: VoiceInputButtonProps) {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  if (isLoading) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        disabled
      >
        <Loader2 size={18} className="animate-spin" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={disabled || (!canUseVoice && !isListening)}
            className={`transition-all ${
              isListening 
                ? "text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse" 
                : canUseVoice
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {!canUseVoice ? (
            <p>Monthly limit reached (10/10 uses)</p>
          ) : isListening ? (
            <p>Click to stop recording</p>
          ) : (
            <p>Voice input ({remainingUses}/10 uses left this month)</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
