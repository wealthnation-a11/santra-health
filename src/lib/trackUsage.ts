import { supabase } from "@/integrations/supabase/client";

export type FeatureName =
  | "first_aid"
  | "first_aid_section"
  | "health_tool"
  | "health_tool_action"
  | "library"
  | "library_dwell"
  | "library_chat_start";

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
