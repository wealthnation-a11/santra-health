import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import { usePricing } from "./usePricing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BillingInterval } from "@/data/pricing";

const PAYSTACK_PUBLIC_KEY = "pk_live_06073764b30e0548a65cacd81f4ac69e18324947";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export function usePaystack() {
  const { user } = useAuth();
  const { refetch } = useSubscription();
  const pricing = usePricing();

  const verifyPayment = useCallback(async (reference: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ reference }),
      }
    );

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Verification failed");
    return result;
  }, []);

  const initiatePayment = useCallback((overrideInterval?: BillingInterval) => {
    if (!user?.email) {
      toast.error("Please log in to upgrade");
      return;
    }

    if (!window.PaystackPop) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    const interval = overrideInterval || pricing.interval;
    const tier = pricing.plan[interval];

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: tier.amount,
      currency: tier.currency,
      ref: `santra_${interval}_${user.id}_${Date.now()}`,
      callback: async (response: { reference: string }) => {
        try {
          toast.loading("Verifying payment...", { id: "payment-verify" });
          await verifyPayment(response.reference);
          await refetch();
          toast.success("Welcome to Santra Premium! 🎉", { id: "payment-verify" });
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed. Please contact support.", { id: "payment-verify" });
        }
      },
      onClose: () => {
        toast.info("Payment cancelled");
      },
    });

    handler.openIframe();
  }, [user, verifyPayment, refetch, pricing]);

  return { initiatePayment, pricing };
}
