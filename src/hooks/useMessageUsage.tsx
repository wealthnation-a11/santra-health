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

  const refreshUsage = useCallback(async () => {
    await fetchUsage();
  }, [fetchUsage]);

  const remainingMessages = isPremium ? Infinity : Math.max(0, DAILY_LIMIT - messageCount);
  const canSendMessage = isPremium || remainingMessages > 0;

  return {
    messageCount,
    remainingMessages,
    canSendMessage,
    dailyLimit: DAILY_LIMIT,
    isLoading,
    refreshUsage,
  };
}
