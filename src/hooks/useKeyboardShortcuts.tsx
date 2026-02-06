import { useEffect, useCallback } from "react";

interface ShortcutHandlers {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onStopGeneration?: () => void;
}

export function useKeyboardShortcuts({
  onNewChat,
  onToggleSidebar,
  onStopGeneration,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Shift + O - New chat
      if (isMod && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        onNewChat?.();
        return;
      }

      // Ctrl/Cmd + Shift + ; - Toggle sidebar
      if (isMod && e.shiftKey && e.key === ";") {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // Escape - Stop generating
      if (e.key === "Escape") {
        onStopGeneration?.();
        return;
      }
    },
    [onNewChat, onToggleSidebar, onStopGeneration]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
