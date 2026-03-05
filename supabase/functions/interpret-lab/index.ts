import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check premium subscription
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: sub } = await serviceClient
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (!sub || sub.plan !== "premium") {
      return new Response(JSON.stringify({ error: "Premium subscription required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath, fileType, preferredLanguage } = await req.json();

    if (!filePath) {
      return new Response(JSON.stringify({ error: "Missing file path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from("lab-uploads")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const isImage = fileType?.startsWith("image/");
    const mimeType = fileType || (isImage ? "image/jpeg" : "application/pdf");

    const systemPrompt = `You are Santra, an expert medical lab result interpreter and AI health assistant. Your role is to analyze medical lab results from uploaded images or documents.

When analyzing lab results:
1. **Identify all test values** shown in the document
2. **Compare each value** against standard reference ranges
3. **Flag abnormal values** clearly (high ⬆️ or low ⬇️)
4. **Explain what each test measures** in simple terms
5. **Provide a summary** of overall health implications
6. **Suggest follow-up actions** if any values are concerning

Format your response clearly with:
- A summary section at the top
- Individual test breakdowns
- Any recommendations

IMPORTANT:
- Always remind users that this is AI-assisted interpretation and should be confirmed with their healthcare provider
- Be thorough but use simple, understandable language
- If the image/document is unclear or not a lab result, politely let the user know
${preferredLanguage && preferredLanguage !== "en" ? `\nRespond in the user's preferred language (code: ${preferredLanguage}).` : ""}`;

    // Build message with file content
    const userContent: any[] = [
      {
        type: "text",
        text: "Please analyze this lab result and provide a detailed interpretation.",
      },
    ];

    if (isImage) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
        },
      });
    } else {
      // For PDFs, we send as text extraction request
      userContent.push({
        type: "text",
        text: `[Attached document (${mimeType}), base64 encoded]: ${base64.substring(0, 50000)}`,
      });
    }

    // Call AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Lab interpreter error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
