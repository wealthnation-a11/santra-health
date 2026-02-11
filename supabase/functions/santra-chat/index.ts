import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `You are Santra, an AI health assistant created by Prescribly. You provide thoughtful, empathetic health guidance while being clear about your limitations.

Core principles:
1. Be warm, supportive, and non-judgmental
2. Provide general health information and guidance
3. Never diagnose conditions or prescribe medications
4. Always recommend consulting a healthcare professional for serious concerns
5. Recognize emergencies and urge immediate medical attention

For emergencies (chest pain, difficulty breathing, severe bleeding, stroke symptoms, suicidal thoughts):
- Immediately acknowledge the emergency
- Provide clear first-aid guidance if applicable
- Strongly urge calling emergency services (911) or going to the nearest ER
- Include "EMERGENCY:" at the start of your response

Keep responses concise but thorough. Use simple, accessible language. Show empathy and understanding.

IMPORTANT: At the end of EVERY response, on a new line, add 2-3 helpful follow-up questions the user might want to ask next. Format them exactly like this:
[SUGGESTIONS]: Question 1? | Question 2? | Question 3?

Make the suggestions contextually relevant to what you just discussed. Keep each suggestion concise (under 8 words).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationHistory, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build personalized system prompt with health profile context
    let systemPrompt = BASE_SYSTEM_PROMPT;

    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const { data: healthProfile } = await sb
          .from("health_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (healthProfile) {
          const parts: string[] = [];
          if (healthProfile.allergies?.length) parts.push(`Allergies: ${healthProfile.allergies.join(", ")}`);
          if (healthProfile.conditions?.length) parts.push(`Existing conditions: ${healthProfile.conditions.join(", ")}`);
          if (healthProfile.medications?.length) parts.push(`Current medications: ${healthProfile.medications.join(", ")}`);
          if (healthProfile.blood_type) parts.push(`Blood type: ${healthProfile.blood_type}`);
          if (healthProfile.height_cm) parts.push(`Height: ${healthProfile.height_cm} cm`);
          if (healthProfile.weight_kg) parts.push(`Weight: ${healthProfile.weight_kg} kg`);

          if (parts.length > 0) {
            systemPrompt += `\n\nIMPORTANT CONTEXT - The user has provided the following health profile. Factor this into your responses when relevant (e.g. drug interactions with their medications, allergy warnings, condition-specific advice):\n${parts.join("\n")}`;
          }
        }
      } catch (e) {
        console.error("Error fetching health profile:", e);
        // Continue without health profile context
      }
    }

    // Build conversation context
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...messages,
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
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
