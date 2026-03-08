import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { getPricingForCountry, type PricingTier } from "@/data/pricing";

export function usePricing(): PricingTier {
  const { profile } = useAuth();
  return useMemo(() => getPricingForCountry(profile?.country), [profile?.country]);
}
