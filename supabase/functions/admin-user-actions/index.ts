// Admin-only user actions. Verifies caller is admin then uses service role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

type Action =
  | "send_password_reset"
  | "send_magic_link"
  | "force_signout"
  | "delete_user"
  | "impersonate";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    // Verify caller is admin using their JWT
    const callerClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Admin only" }, 403);

    const body = await req.json();
    const action = body.action as Action;
    const targetId = body.user_id as string | undefined;
    if (!action || !targetId) return json({ error: "Missing action or user_id" }, 400);

    // Fetch target email
    const { data: targetAuth, error: getErr } = await admin.auth.admin.getUserById(targetId);
    if (getErr || !targetAuth?.user) return json({ error: "User not found" }, 404);
    const email = targetAuth.user.email!;
    const redirectTo = body.redirect_to as string | undefined;

    let result: Record<string, unknown> = { ok: true };

    switch (action) {
      case "send_password_reset": {
        const { data, error } = await admin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: redirectTo ? { redirectTo } : undefined,
        });
        if (error) throw error;
        result = { ok: true, action_link: data?.properties?.action_link };
        break;
      }
      case "send_magic_link": {
        const { data, error } = await admin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: redirectTo ? { redirectTo } : undefined,
        });
        if (error) throw error;
        result = { ok: true, action_link: data?.properties?.action_link };
        break;
      }
      case "impersonate": {
        // Same as magic link but returned to the admin to open in a private window.
        const { data, error } = await admin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: redirectTo ? { redirectTo } : undefined,
        });
        if (error) throw error;
        result = { ok: true, action_link: data?.properties?.action_link, email };
        break;
      }
      case "force_signout": {
        const { error } = await admin.auth.admin.signOut(targetId, "global");
        if (error) throw error;
        result = { ok: true };
        break;
      }
      case "delete_user": {
        // Cascade: feature data, conversations, etc.
        await admin.from("messages").delete().in(
          "conversation_id",
          (await admin.from("conversations").select("id").eq("user_id", targetId)).data?.map((r: any) => r.id) ?? []
        );
        await admin.from("conversations").delete().eq("user_id", targetId);
        await admin.from("feature_usage").delete().eq("user_id", targetId);
        await admin.from("voice_usage").delete().eq("user_id", targetId);
        await admin.from("daily_message_usage").delete().eq("user_id", targetId);
        await admin.from("health_profiles").delete().eq("user_id", targetId);
        await admin.from("user_memory").delete().eq("user_id", targetId);
        await admin.from("subscriptions").delete().eq("user_id", targetId);
        await admin.from("pinned_messages").delete().eq("user_id", targetId);
        await admin.from("bookmarks").delete().eq("user_id", targetId);
        await admin.from("user_roles").delete().eq("user_id", targetId);
        await admin.from("profiles").delete().eq("id", targetId);
        const { error } = await admin.auth.admin.deleteUser(targetId);
        if (error) throw error;
        result = { ok: true };
        break;
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }

    await admin.from("admin_audit_log").insert({
      admin_id: userData.user.id,
      action,
      target_id: targetId,
      details: { email },
    });

    return json(result);
  } catch (e) {
    console.error("admin-user-actions error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
