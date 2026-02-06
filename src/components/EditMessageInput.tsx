import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "./ui/button";

interface EditMessageInputProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function EditMessageInput({ initialContent, onSave, onCancel }: EditMessageInputProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
      // Auto-resize
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onSave(content.trim());
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px]"
        placeholder="Edit your message..."
      />
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 px-3 text-muted-foreground"
        >
          <X size={14} className="mr-1" />
          Cancel
        </Button>
        <Button
          variant="santra"
          size="sm"
          onClick={() => content.trim() && onSave(content.trim())}
          disabled={!content.trim()}
          className="h-8 px-3"
        >
          <Check size={14} className="mr-1" />
          Save & Submit
        </Button>
      </div>
    </div>
  );
}
