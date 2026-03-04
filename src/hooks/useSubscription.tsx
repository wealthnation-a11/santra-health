import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const [plan, setPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isPremium = plan === "premium";

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
    } else {
      setPlan(data?.plan || "free");
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { plan, isPremium, isLoading, refetch: fetchSubscription };
}
