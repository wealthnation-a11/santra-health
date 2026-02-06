import { useState } from "react";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MessageActionsProps {
  messageId: string;
  content: string;
  role: "user" | "assistant";
  isLastAssistant?: boolean;
  isLastUser?: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
  feedback?: "positive" | "negative" | null;
  onFeedbackChange?: (feedback: "positive" | "negative" | null) => void;
}

export function MessageActions({
  messageId,
  content,
  role,
  isLastAssistant = false,
  isLastUser = false,
  onRegenerate,
  onEdit,
  feedback: initialFeedback,
  onFeedbackChange,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(initialFeedback || null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { user } = useAuth();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFeedback = async (type: "positive" | "negative") => {
    if (!user || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    const newFeedback = feedback === type ? null : type;

    try {
      if (newFeedback === null) {
        // Remove feedback
        await supabase
          .from("message_feedback")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", user.id);
      } else if (feedback) {
        // Update existing feedback
        await supabase
          .from("message_feedback")
          .update({ feedback: newFeedback })
          .eq("message_id", messageId)
          .eq("user_id", user.id);
      } else {
        // Insert new feedback
        await supabase
          .from("message_feedback")
          .insert({ message_id: messageId, user_id: user.id, feedback: newFeedback });
      }

      setFeedback(newFeedback);
      onFeedbackChange?.(newFeedback);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const isUser = role === "user";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Copy button - for all messages */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{copied ? "Copied!" : "Copy"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Edit button - for user messages */}
        {isUser && isLastUser && onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
              >
                <Pencil size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Regenerate button - for assistant messages */}
        {!isUser && isLastAssistant && onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onRegenerate}
              >
                <RefreshCw size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Regenerate</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Feedback buttons - for assistant messages */}
        {!isUser && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${
                    feedback === "positive"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleFeedback("positive")}
                  disabled={isSubmittingFeedback}
                >
                  <ThumbsUp size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Good response</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${
                    feedback === "negative"
                      ? "text-destructive bg-destructive/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleFeedback("negative")}
                  disabled={isSubmittingFeedback}
                >
                  <ThumbsDown size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Bad response</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
