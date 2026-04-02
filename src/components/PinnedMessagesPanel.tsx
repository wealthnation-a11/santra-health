import { useState, useEffect } from "react";
import { Pin, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PinnedMessage {
  id: string;
  message_id: string;
  content: string;
  created_at: string;
}

interface PinnedMessagesPanelProps {
  conversationId: string;
  onScrollToMessage?: (messageId: string) => void;
}

export function PinnedMessagesPanel({ conversationId, onScrollToMessage }: PinnedMessagesPanelProps) {
  const { user } = useAuth();
  const [pins, setPins] = useState<PinnedMessage[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user || !conversationId) return;
    (async () => {
      const { data: pinData } = await supabase
        .from("pinned_messages")
        .select("id, message_id, created_at")
        .eq("user_id", user.id)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false });

      if (!pinData || pinData.length === 0) {
        setPins([]);
        return;
      }

      // Fetch message content for each pin
      const msgIds = pinData.map((p) => p.message_id);
      const { data: messages } = await supabase
        .from("messages")
        .select("id, content")
        .in("id", msgIds);

      const contentMap = new Map((messages || []).map((m) => [m.id, m.content]));
      setPins(
        pinData.map((p) => ({
          id: p.id,
          message_id: p.message_id,
          content: contentMap.get(p.message_id) || "",
          created_at: p.created_at,
        }))
      );
    })();
  }, [user, conversationId]);

  const handleUnpin = async (pinId: string) => {
    await supabase.from("pinned_messages").delete().eq("id", pinId);
    setPins((prev) => prev.filter((p) => p.id !== pinId));
  };

  if (pins.length === 0) return null;

  return (
    <div className="border-b border-border bg-muted/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Pin size={14} className="text-primary" />
          <span className="font-medium text-foreground">
            {pins.length} pinned message{pins.length > 1 ? "s" : ""}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border text-sm cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => onScrollToMessage?.(pin.message_id)}
            >
              <p className="flex-1 text-foreground line-clamp-2">{pin.content.slice(0, 150)}{pin.content.length > 150 ? "…" : ""}</p>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); handleUnpin(pin.id); }}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
