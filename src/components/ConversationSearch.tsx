import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ConversationSearch({
  value,
  onChange,
  placeholder = "Search conversations...",
}: ConversationSearchProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-9 bg-sidebar-accent/50 border-sidebar-border focus:bg-sidebar-accent"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => onChange("")}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}
