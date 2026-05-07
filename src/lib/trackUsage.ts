import { supabase } from "@/integrations/supabase/client";

export type FeatureName = "first_aid" | "health_tool" | "library";

export async function trackUsage(
  feature: FeatureName,
  itemKey?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("feature_usage").insert([{
      user_id: user.id,
      feature,
      item_key: itemKey ?? null,
      metadata: (metadata ?? {}) as any,
    }]);
  } catch {
    // silent — analytics shouldn't break UX
  }
}
