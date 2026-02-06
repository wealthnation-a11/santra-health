import { Square } from "lucide-react";
import { Button } from "./ui/button";

interface StopGenerationButtonProps {
  onStop: () => void;
}

export function StopGenerationButton({ onStop }: StopGenerationButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onStop}
      className="gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
    >
      <Square size={14} className="fill-current" />
      Stop generating
    </Button>
  );
}
