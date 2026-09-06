import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return "lab_" + hex;
}

async function isAdmin(authClient: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await authClient.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub;

    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    if (!(await isAdmin(authClient, userId))) {
      return new Response(JSON.stringify({ error: "Forbidden — admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // --- CREATE ---
    if (action === "create") {
      const name = (body.name || "").toString().trim();
      const dailyLimit = Number(body.daily_limit) || 100;
      if (!name) {
        return new Response(JSON.stringify({ error: "Name required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const rawKey = randomKey();
      const keyHash = await sha256Hex(rawKey);
      const keyPrefix = rawKey.slice(0, 12);
      const { error } = await serviceClient.from("lab_api_keys").insert({
        key_hash: keyHash, key_prefix: keyPrefix, name, daily_limit: dailyLimit, created_by: userId,
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ key: rawKey }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- LIST ---
    if (action === "list") {
      const { data, error } = await serviceClient
        .from("lab_api_keys")
        .select("id,key_prefix,name,is_active,daily_limit,total_requests,last_used_at,created_at")
        .order("created_at", { ascending: false });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ keys: data || [] }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- REVOKE ---
    if (action === "revoke") {
      const { error } = await serviceClient.from("lab_api_keys")
        .update({ is_active: false }).eq("id", body.id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- RESTORE ---
    if (action === "restore") {
      const { error } = await serviceClient.from("lab_api_keys")
        .update({ is_active: true }).eq("id", body.id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- STATS ---
    if (action === "stats") {
      const days = Number(body.days) || 7;
      const { data, error } = await serviceClient.rpc("admin_lab_api_usage_stats", { p_days: days });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ stats: data || [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lab-api-admin error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
