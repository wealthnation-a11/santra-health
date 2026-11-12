import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SYSTEM_PROMPT = `You are Santra, an expert medical lab result interpreter and AI health assistant. Your role is to analyze medical lab results from uploaded images or documents.

When analyzing lab results:
1. Identify all test values shown in the document
2. Compare each value against standard reference ranges
3. Flag abnormal values clearly (high or low)
4. Explain what each test measures in simple terms
5. Provide a summary of overall health implications
6. Suggest follow-up actions if any values are concerning

Format your response clearly with:
- A summary section at the top
- Individual test breakdowns
- Any recommendations

IMPORTANT:
- Always remind users that this is AI-assisted interpretation and should be confirmed with their healthcare provider
- Be thorough but use simple, understandable language
- If the image/document is unclear or not a lab result, politely let the user know`;

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isPublicIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b, c] = parts;
  return !(
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 0 || b === 168)) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

function isPublicIpv6(address: string): boolean {
  const normalized = address.toLowerCase().split("%")[0];
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice(7);
    return mapped.includes(".") ? isPublicIpv4(mapped) : false;
  }
  const groups = normalized.split("::");
  if (groups.length > 2) return false;
  const parseGroups = (part: string) => part ? part.split(":").map((g) => parseInt(g || "0", 16)) : [];
  const left = parseGroups(groups[0]);
  const right = parseGroups(groups[1] || "");
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (groups.length === 1 && missing !== 0)) return false;
  const words = [...left, ...Array(missing).fill(0), ...right];
  if (words.length !== 8 || words.some((n) => !Number.isInteger(n) || n < 0 || n > 0xffff)) return false;

  // Only global-unicast space (2000::/3) is allowed. Exclude documentation and 6to4.
  if ((words[0] & 0xe000) !== 0x2000) return false;
  if (words[0] === 0x2001 && (words[1] === 0x0db8 || (words[1] & 0xfff0) === 0x0010)) return false;
  if (words[0] === 0x2002) return false;
  return true;
}

function isIpLiteral(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "");
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

async function validatePublicHttpsUrl(value: string): Promise<URL | null> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") ||
      isIpLiteral(host) || host === "localhost" || host.endsWith(".localhost") ||
      host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".test")) return null;

  try {
    const results = await Promise.allSettled([
      Deno.resolveDns(host, "A"),
      Deno.resolveDns(host, "AAAA"),
    ]);
    const addresses = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    if (!addresses.length) return null;
    if (addresses.some((ip) => ip.includes(":") ? !isPublicIpv6(ip) : !isPublicIpv4(ip))) return null;
  } catch {
    return null;
  }
  return url;
}

async function logUsage(
  serviceClient: ReturnType<typeof createClient>,
  keyId: string,
  status: string,
  errorMessage?: string
) {
  try {
    await serviceClient.from("lab_api_usage").insert({
      key_id: keyId,
      status,
      error_message: errorMessage || null,
    });
    await serviceClient
      .from("lab_api_keys")
      .update({ last_used_at: new Date().toISOString(), total_requests: "increment" })
      .eq("id", keyId);
  } catch (e) {
    console.error("Usage log error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // --- API key validation ---
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || !apiKey.startsWith("lab_")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid API key. Provide it in the 'x-api-key' header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyHash = await sha256(apiKey);
    const { data: keyRow } = await serviceClient
      .from("lab_api_keys")
      .select("id, is_active, daily_limit, name")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (!keyRow || !keyRow.is_active) {
      return new Response(
        JSON.stringify({ error: "Invalid or revoked API key." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Daily quota check ---
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: usedToday } = await serviceClient
      .from("lab_api_usage")
      .select("id", { count: "exact", head: true })
      .eq("key_id", keyRow.id)
      .gte("created_at", todayStart.toISOString());

    if ((usedToday ?? 0) >= keyRow.daily_limit) {
      await logUsage(serviceClient, keyRow.id, "rate_limited");
      return new Response(
        JSON.stringify({
          error: `Daily limit (${keyRow.daily_limit} requests/day) exceeded for key '${keyRow.name}'.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Parse request body ---
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { file, mimeType, fileUrl, preferredLanguage = "en" } = body;

    let base64: string;
    let finalMimeType: string;

    if (file && typeof file === "string") {
      // Strip optional data URL prefix
      base64 = file.replace(/^data:[^;]+;base64,/, "");
      finalMimeType = mimeType || "image/jpeg";
    } else if (fileUrl && typeof fileUrl === "string" && fileUrl.length <= 2048) {
      const safeUrl = await validatePublicHttpsUrl(fileUrl);
      if (!safeUrl) {
        await logUsage(serviceClient, keyRow.id, "error", "Blocked unsafe file URL");
        return new Response(JSON.stringify({ error: "fileUrl must be a public HTTPS file URL." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Do not follow redirects: the redirect destination would bypass host validation.
      const dl = await fetch(safeUrl, { redirect: "manual", signal: AbortSignal.timeout(10000) });
      if (!dl.ok || dl.status >= 300) {
        return new Response(
          JSON.stringify({ error: "Could not download file from the provided URL." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const contentLength = Number(dl.headers.get("content-length") || 0);
      if (contentLength > 12 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: "Files must be 12 MB or smaller." }), {
          status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const reader = dl.body?.getReader();
      if (!reader) {
        return new Response(JSON.stringify({ error: "Could not download file from the provided URL." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
        if (totalBytes > 12 * 1024 * 1024) {
          await reader.cancel();
          return new Response(JSON.stringify({ error: "Files must be 12 MB or smaller." }), {
            status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        chunks.push(value);
      }
      const buf = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        buf.set(chunk, offset);
        offset += chunk.length;
      }
      let binary = "";
      for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
      base64 = btoa(binary);
      finalMimeType = mimeType || (dl.headers.get("content-type") || "").split(";")[0].trim() || "application/octet-stream";
    } else {
      return new Response(
        JSON.stringify({ error: "Provide a base64 'file' (with 'mimeType') or a 'fileUrl'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isImage = finalMimeType.startsWith("image/");

    const userContent: Array<Record<string, unknown>> = [
      { type: "text", text: "Please analyze this lab result and provide a detailed interpretation." },
    ];

    if (isImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${finalMimeType};base64,${base64}` },
      });
    } else {
      userContent.push({
        type: "text",
        text: `[Attached document (${finalMimeType}), base64 encoded]: ${base64.substring(0, 50000)}`,
      });
    }

    const langInstruction =
      preferredLanguage && preferredLanguage !== "en"
        ? `\nRespond in the user's preferred language (code: ${preferredLanguage}).`
        : "";

    // --- Call AI Gateway (non-streaming, returns full JSON) ---
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langInstruction },
          { role: "user", content: userContent },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await logUsage(serviceClient, keyRow.id, "error", `AI ${aiResponse.status}`);
      const status = aiResponse.status === 429 ? 429 : aiResponse.status === 402 ? 402 : 500;
      const message =
        aiResponse.status === 429
          ? "AI rate limit exceeded. Try again later."
          : aiResponse.status === 402
          ? "AI service temporarily unavailable."
          : "AI analysis failed.";
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiJson = await aiResponse.json();
    const interpretation =
      aiJson.choices?.[0]?.message?.content || "No interpretation could be generated.";

    await logUsage(serviceClient, keyRow.id, "success");

    return new Response(
      JSON.stringify({
        interpretation,
        disclaimer:
          "This is AI-assisted interpretation and should be confirmed with a licensed healthcare provider. Not a medical diagnosis.",
        model: "gemini-2.5-pro",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("lab-api error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
