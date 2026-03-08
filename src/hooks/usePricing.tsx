import { useMemo, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getPricingPlanForCountry, type PricingTier, type PricingPlan, type BillingInterval } from "@/data/pricing";

export function usePricing() {
  const { profile } = useAuth();
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const plan: PricingPlan = useMemo(
    () => getPricingPlanForCountry(profile?.country),
    [profile?.country]
  );

  const activeTier: PricingTier = plan[interval];

  const toggleInterval = useCallback(() => {
    setInterval((prev) => (prev === "monthly" ? "annual" : "monthly"));
  }, []);

  return {
    ...activeTier,
    interval,
    setInterval,
    toggleInterval,
    plan,
    annualSavingsLabel: plan.annualSavingsLabel,
  };
}

export type { PricingTier, BillingInterval };
