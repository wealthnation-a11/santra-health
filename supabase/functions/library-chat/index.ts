import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.slice("Bearer ".length);
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (claimsError || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const libraryId = body?.libraryId;
    const tiers: Record<string, "free" | "starter" | "pro"> = {
      "medical-dictionary": "free",
      "anatomy-physiology": "free",
      "diseases-conditions": "free",
      pharmacology: "starter",
      "laboratory-tests": "starter",
      "study-prep": "starter",
      "clinical-cases": "pro",
      "research-evidence": "pro",
    };
    const tier = typeof libraryId === "string" ? tiers[libraryId] : undefined;
    if (!body || !tier || !Array.isArray(body.messages) || !Array.isArray(body.conversationHistory) ||
        body.messages.length < 1 || body.messages.length > 10 || body.conversationHistory.length > 80) {
      return new Response(JSON.stringify({ error: "Invalid library chat request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const isValidMessage = (message: unknown, current: boolean) => {
      if (!message || typeof message !== "object") return false;
      const item = message as { role?: unknown; content?: unknown };
      return (item.role === "user" || (!current && item.role === "assistant")) &&
        typeof item.content === "string" && item.content.trim().length > 0 && item.content.length <= 20000;
    };
    if (!body.messages.every((m: unknown) => isValidMessage(m, true)) ||
        !body.conversationHistory.every((m: unknown) => isValidMessage(m, false))) {
      return new Response(JSON.stringify({ error: "Invalid chat message" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tier !== "free") {
      const { data: subscription, error: subscriptionError } = await authClient
        .from("subscriptions")
        .select("plan")
        .eq("user_id", userId)
        .eq("plan_type", "edu")
        .eq("status", "active")
        .maybeSingle();
      const requiredPlan = tier === "pro" ? "edu_pro" : "edu_starter";
      const hasAccess = subscription?.plan === "edu_pro" ||
        (tier === "starter" && subscription?.plan === "edu_starter");
      if (subscriptionError || !hasAccess) {
        return new Response(JSON.stringify({ error: `${requiredPlan} subscription required` }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Library chat request for library: ${libraryId}`);

    // Only server-defined instructions are passed to the model.
    const systemPrompt = `You are Santra inside the ${libraryId} educational library. Follow its educational scope, do not diagnose or prescribe, and remind users to consult a qualified healthcare professional for personal medical decisions. Keep the response focused, clear, and educational. At the end, include 2-3 concise contextual follow-up questions in this exact format: [SUGGESTIONS]: Question 1? | Question 2?`;
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...body.conversationHistory.map((msg: { role: "user" | "assistant"; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...body.messages,
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Library chat error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process library chat request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
