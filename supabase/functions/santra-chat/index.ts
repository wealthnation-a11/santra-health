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

When appropriate, use rich formatting:
- Use markdown tables for comparisons or structured data
- Use bullet checklists for action items
- Use **bold** for key terms and important warnings
- Use collapsible sections with <details><summary>Title</summary>Content</details> for supplementary info like sources or detailed explanations

MEMORY EXTRACTION: After generating your response, analyze the conversation for important health facts worth remembering about this user. If you identify any, add them at the very end of your response on a new line in this exact format:
[MEMORY]: fact1 | fact2 | fact3
Categories of facts to remember: symptoms they experience regularly, medications they take, conditions they have, lifestyle habits, health goals, allergies, family health history.
Only extract genuinely important, specific health facts. Do NOT extract generic conversation topics. If nothing is worth remembering, do not include the [MEMORY] line.

IMPORTANT: At the end of EVERY response (before any [MEMORY] line), on a new line, add 2-3 helpful follow-up questions the user might want to ask next. Format them exactly like this:
[SUGGESTIONS]: Question 1? | Question 2? | Question 3?

Make the suggestions contextually relevant to what you just discussed. Keep each suggestion concise (under 8 words).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationHistory, userId, preferredLanguage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Build personalized system prompt with health profile context
    let systemPrompt = BASE_SYSTEM_PROMPT;

    if (userId) {
      try {
        // Fetch health profile
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

        // Fetch AI memories
        const { data: memories } = await sb
          .from("user_memory")
          .select("memory_text, category")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(20);

        if (memories && memories.length > 0) {
          const memoryLines = memories.map((m: { memory_text: string; category: string }) => `- [${m.category}] ${m.memory_text}`);
          systemPrompt += `\n\nAI MEMORY - Things you remember about this user from previous conversations. Reference these naturally when relevant (e.g. "Last time you mentioned your migraines — how are those going?"). Do NOT list these back to the user unprompted:\n${memoryLines.join("\n")}`;
        }
      } catch (e) {
        console.error("Error fetching user context:", e);
      }
    }

    // Add language instruction if not English
    if (preferredLanguage && preferredLanguage !== "en") {
      const langMap: Record<string, string> = {
        es: "Spanish", fr: "French", de: "German", it: "Italian", pt: "Portuguese",
        zh: "Chinese (Simplified)", ja: "Japanese", ko: "Korean", ar: "Arabic",
        hi: "Hindi", ru: "Russian", nl: "Dutch", pl: "Polish", tr: "Turkish",
        vi: "Vietnamese", th: "Thai", id: "Indonesian", ms: "Malay", sw: "Swahili",
        yo: "Yoruba", ha: "Hausa", ig: "Igbo", am: "Amharic", zu: "Zulu",
      };
      const langName = langMap[preferredLanguage] || preferredLanguage;
      systemPrompt += `\n\nIMPORTANT: Always respond in ${langName}. The user prefers ${langName} as their language.`;
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

    // We need to intercept the stream to extract [MEMORY] tags and save them
    // Create a TransformStream to process the SSE data
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // Process stream in background
    (async () => {
      let fullContent = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Pass through to client
          await writer.write(encoder.encode(chunk));
          
          // Also accumulate content for memory extraction
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch { /* ignore */ }
          }
        }
      } catch (e) {
        console.error("Stream processing error:", e);
      } finally {
        await writer.close();
        
        // Extract and save memories after stream completes
        if (userId && fullContent) {
          try {
            const memoryMatch = fullContent.match(/\[MEMORY\]:\s*(.+)/);
            if (memoryMatch) {
              const memoryItems = memoryMatch[1].split("|").map((m: string) => m.trim()).filter(Boolean);
              
              for (const memoryText of memoryItems) {
                // Determine category from content
                let category = "general";
                const lower = memoryText.toLowerCase();
                if (lower.includes("allerg")) category = "allergy";
                else if (lower.includes("medicat") || lower.includes("taking") || lower.includes("prescri")) category = "medication";
                else if (lower.includes("symptom") || lower.includes("pain") || lower.includes("ache")) category = "symptom";
                else if (lower.includes("condition") || lower.includes("diagnos")) category = "condition";
                else if (lower.includes("goal") || lower.includes("want to") || lower.includes("trying to")) category = "goal";
                else if (lower.includes("family") || lower.includes("mother") || lower.includes("father")) category = "family_history";
                else if (lower.includes("exercise") || lower.includes("diet") || lower.includes("sleep") || lower.includes("smoke") || lower.includes("drink")) category = "lifestyle";

                // Check for duplicate
                const { data: existing } = await sb
                  .from("user_memory")
                  .select("id")
                  .eq("user_id", userId)
                  .eq("memory_text", memoryText)
                  .maybeSingle();

                if (!existing) {
                  await sb.from("user_memory").insert({
                    user_id: userId,
                    memory_text: memoryText,
                    category,
                  });
                }
              }
            }
          } catch (e) {
            console.error("Error saving memories:", e);
          }
        }
      }
    })();

    return new Response(readable, {
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
