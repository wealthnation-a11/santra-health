import { useState, useRef, useEffect } from "react";

interface ConversationRenameInputProps {
  initialTitle: string;
  onSave: (title: string) => void;
  onCancel: () => void;
}

export function ConversationRenameInput({
  initialTitle,
  onSave,
  onCancel,
}: ConversationRenameInputProps) {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (title.trim()) {
        onSave(title.trim());
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (title.trim() && title.trim() !== initialTitle) {
      onSave(title.trim());
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-full bg-sidebar-accent border border-primary rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
      maxLength={50}
    />
  );
}
