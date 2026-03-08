import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type EduPlan = "free" | "edu_starter" | "edu_pro";

export function useEduSubscription() {
  const [eduPlan, setEduPlan] = useState<EduPlan>("free");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const isEduStarter = eduPlan === "edu_starter" || eduPlan === "edu_pro";
  const isEduPro = eduPlan === "edu_pro";

  const fetchEduSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, plan_type")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("plan_type", "edu")
      .maybeSingle();

    if (error) {
      console.error("Error fetching edu subscription:", error);
    } else if (data?.plan) {
      setEduPlan(data.plan as EduPlan);
    } else {
      setEduPlan("free");
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEduSubscription();
  }, [fetchEduSubscription]);

  return { eduPlan, isEduStarter, isEduPro, isLoading, refetch: fetchEduSubscription };
}
