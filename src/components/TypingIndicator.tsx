export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-santra-chat-ai rounded-2xl rounded-bl-md w-fit animate-fade-in">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-primary rounded-full typing-dot" />
        <div className="w-2 h-2 bg-primary rounded-full typing-dot" />
        <div className="w-2 h-2 bg-primary rounded-full typing-dot" />
      </div>
      <span className="text-sm text-muted-foreground ml-1">Santra is thinking…</span>
    </div>
  );
}
