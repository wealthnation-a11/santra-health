import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";

const DAILY_LIMIT = 15;

export function useMessageUsage() {
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const today = getTodayDate();

    const { data, error } = await supabase
      .from("daily_message_usage")
      .select("message_count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    if (error) {
      console.error("Error fetching message usage:", error);
    } else {
      setMessageCount(data?.message_count || 0);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementUsage = useCallback(async () => {
    if (!user) return false;

    const today = getTodayDate();
    const newCount = messageCount + 1;

    // Try update first
    const { data: existing } = await supabase
      .from("daily_message_usage")
      .select("id, message_count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("daily_message_usage")
        .update({ message_count: existing.message_count + 1 })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating message usage:", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from("daily_message_usage")
        .insert({ user_id: user.id, usage_date: today, message_count: 1 });

      if (error) {
        console.error("Error inserting message usage:", error);
        return false;
      }
    }

    setMessageCount(newCount);
    return true;
  }, [user, messageCount]);

  const remainingMessages = isPremium ? Infinity : Math.max(0, DAILY_LIMIT - messageCount);
  const canSendMessage = isPremium || remainingMessages > 0;

  return {
    messageCount,
    remainingMessages,
    canSendMessage,
    dailyLimit: DAILY_LIMIT,
    isLoading,
    incrementUsage,
  };
}
