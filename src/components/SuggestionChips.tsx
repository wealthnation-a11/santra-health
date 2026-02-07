import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function parseSuggestions(content: string): { cleanContent: string; suggestions: string[] } {
  const suggestionMatch = content.match(/\[SUGGESTIONS\]:\s*(.+?)$/m);
  
  if (!suggestionMatch) {
    return { cleanContent: content, suggestions: [] };
  }
  
  const suggestionsLine = suggestionMatch[1];
  const suggestions = suggestionsLine
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 3); // Max 3 suggestions
  
  const cleanContent = content.replace(/\n?\[SUGGESTIONS\]:\s*(.+?)$/m, "").trim();
  
  return { cleanContent, suggestions };
}

export function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 animate-fade-in">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Follow-up questions</span>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelect(suggestion)}
              className="flex-shrink-0 h-auto py-2 px-3 text-xs font-normal whitespace-normal text-left max-w-[200px] hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
            >
              {suggestion}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
