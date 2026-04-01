import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseRealtimeMessagesOptions {
  userId: string | undefined;
  activeConversationId: string | null;
  onNewMessage?: () => void;
}

export function useRealtimeMessages({
  userId,
  activeConversationId,
  onNewMessage,
}: UseRealtimeMessagesOptions) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            conversation_id: string;
            role: string;
            content: string;
          };

          // Only notify for assistant messages in conversations other than the active one
          if (
            newMsg.role === "assistant" &&
            newMsg.conversation_id !== activeConversationId
          ) {
            const preview = newMsg.content.slice(0, 80) + (newMsg.content.length > 80 ? "…" : "");
            toast("New response received", {
              description: preview,
              duration: 5000,
            });
          }

          onNewMessage?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeConversationId, onNewMessage]);
}
