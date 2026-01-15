import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isEmergency?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export function useConversations() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOnboarded = profile?.onboarding_completed && profile?.terms_accepted_at;

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!user || !isOnboarded) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;

      if (!convData || convData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch messages for all conversations
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convData.map((c) => c.id))
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      const conversationsWithMessages: Conversation[] = convData.map((conv) => {
        const messages = (msgData || [])
          .filter((m) => m.conversation_id === conv.id)
          .map((m) => ({
            id: m.id,
            content: m.content,
            role: m.role as "user" | "assistant",
            timestamp: new Date(m.created_at),
            isEmergency: m.is_emergency,
          }));

        const lastMsg = messages[messages.length - 1];
        return {
          id: conv.id,
          title: conv.title,
          lastMessage: lastMsg?.content.slice(0, 50) + "..." || "",
          timestamp: new Date(conv.updated_at),
          messages,
        };
      });

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isOnboarded]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (title: string): Promise<string | null> => {
    if (!user || !isOnboarded) return null;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        lastMessage: "",
        timestamp: new Date(data.created_at),
        messages: [],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  const addMessage = async (
    conversationId: string,
    content: string,
    role: "user" | "assistant",
    isEmergency: boolean = false
  ): Promise<Message | null> => {
    if (!user || !isOnboarded) return null;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          content,
          role,
          is_emergency: isEmergency,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: Message = {
        id: data.id,
        content: data.content,
        role: data.role as "user" | "assistant",
        timestamp: new Date(data.created_at),
        isEmergency: data.is_emergency,
      };

      // Update local state
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: content.slice(0, 50) + "...",
                timestamp: new Date(),
                messages: [...conv.messages, newMessage],
              }
            : conv
        )
      );

      // Update conversation title if it's the first user message
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv && conv.messages.length === 0 && role === "user") {
        await supabase
          .from("conversations")
          .update({ title: content.slice(0, 30) + (content.length > 30 ? "..." : "") })
          .eq("id", conversationId);
        
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, title: content.slice(0, 30) + (content.length > 30 ? "..." : "") }
              : c
          )
        );
      }

      return newMessage;
    } catch (error) {
      console.error("Error adding message:", error);
      return null;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    deleteConversation,
    loading,
    refetch: fetchConversations,
  };
}
