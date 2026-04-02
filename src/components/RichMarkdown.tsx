import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react";

interface RichMarkdownProps {
  content: string;
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-2 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && <div className="px-3 py-2 text-sm">{children}</div>}
    </div>
  );
}

export function RichMarkdown({ content }: RichMarkdownProps) {
  // Parse <details><summary>...</summary>...</details> blocks into collapsible sections
  const parts: React.ReactNode[] = [];
  const detailsRegex = /<details>\s*<summary>(.*?)<\/summary>([\s\S]*?)<\/details>/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = detailsRegex.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const before = content.slice(lastIndex, match.index);
      parts.push(<MarkdownBlock key={key++} text={before} />);
    }
    // Add collapsible section
    parts.push(
      <CollapsibleSection key={key++} title={match[1].trim()}>
        <MarkdownBlock text={match[2].trim()} />
      </CollapsibleSection>
    );
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push(<MarkdownBlock key={key++} text={content.slice(lastIndex)} />);
  }

  return (
    <div className="text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2">
      {parts}
    </div>
  );
}

function MarkdownBlock({ text }: { text: string }) {
  // Transform checklist items: - [ ] and - [x]
  const processed = text
    .replace(/^- \[x\] (.+)$/gm, "✅ $1")
    .replace(/^- \[ \] (.+)$/gm, "⬜ $1");

  return <ReactMarkdown>{processed}</ReactMarkdown>;
}
