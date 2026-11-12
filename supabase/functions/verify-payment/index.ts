import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

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
    const authUserResult = await supabase.auth.getUser(token);
    const userEmail = authUserResult.data.user?.email?.trim().toLowerCase();
    const body = await req.json().catch(() => null);
    const reference = body?.reference;
    const refMatch = typeof reference === "string"
      ? /^santra_(premium|edu_starter|edu_pro)_(monthly|annual)_([0-9a-f-]{36})_(\d{10,})$/i.exec(reference)
      : null;

    if (!userEmail || authUserResult.error || !refMatch || refMatch[3].toLowerCase() !== userId.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Missing payment reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planKey = refMatch[1].toLowerCase();
    const interval = refMatch[2].toLowerCase();
    const isEducation = planKey !== "premium";
    const dbPlanType = isEducation ? "edu" : "chat";
    const plan = isEducation ? planKey : "premium";

    // Verify payment with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== "success" ||
        verifyData.data?.reference !== reference ||
        verifyData.data?.customer?.email?.trim()?.toLowerCase() !== userEmail) {
      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: profile } = await serviceClient.from("profiles").select("country").eq("id", userId).maybeSingle();
    const country = profile?.country || "";
    const africa = new Set(["Nigeria", "Ghana", "South Africa", "Kenya", "Egypt", "Tanzania", "Uganda", "Ethiopia", "Rwanda", "Cameroon", "Senegal", "Ivory Coast", "Angola", "Mozambique", "Zambia", "Zimbabwe", "Botswana"]);
    const chatPricing: Record<string, { currency: string; monthly: number; annual: number }> = {
      Nigeria: { currency: "NGN", monthly: 450000, annual: 3750000 },
      Ghana: { currency: "GHS", monthly: 5000, annual: 41700 },
      "South Africa": { currency: "ZAR", monthly: 9000, annual: 75000 },
      Kenya: { currency: "KES", monthly: 65000, annual: 541700 },
    };
    const educationPricing: Record<string, { currency: string; starterMonthly: number; starterAnnual: number; proMonthly: number; proAnnual: number }> = {
      Nigeria: { currency: "NGN", starterMonthly: 200000, starterAnnual: 1670000, proMonthly: 800000, proAnnual: 6670000 },
      Ghana: { currency: "GHS", starterMonthly: 2000, starterAnnual: 16700, proMonthly: 8000, proAnnual: 66700 },
      "South Africa": { currency: "ZAR", starterMonthly: 3600, starterAnnual: 30000, proMonthly: 14400, proAnnual: 120000 },
      Kenya: { currency: "KES", starterMonthly: 26000, starterAnnual: 216700, proMonthly: 104000, proAnnual: 866700 },
    };
    const fallbackCurrency = africa.has(country) ? "USD" : "USD";
    const chatPrice = chatPricing[country] || { currency: fallbackCurrency, monthly: africa.has(country) ? 300 : 500, annual: africa.has(country) ? 2500 : 4167 };
    const eduPrice = educationPricing[country] || { currency: "USD", starterMonthly: 200, starterAnnual: 1700, proMonthly: 800, proAnnual: 6700 };
    const expectedCurrency = isEducation ? eduPrice.currency : chatPrice.currency;
    const expectedAmount = isEducation
      ? planKey === "edu_starter"
        ? (interval === "annual" ? eduPrice.starterAnnual : eduPrice.starterMonthly)
        : (interval === "annual" ? eduPrice.proAnnual : eduPrice.proMonthly)
      : (interval === "annual" ? chatPrice.annual : chatPrice.monthly);
    if (verifyData.data.amount !== expectedAmount || verifyData.data.currency !== expectedCurrency) {
      return new Response(JSON.stringify({ error: "Payment amount or currency does not match this plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: fulfilled, error: fulfillmentError } = await serviceClient.rpc("fulfill_verified_payment", {
      p_reference: reference,
      p_user_id: userId,
      p_plan_type: dbPlanType,
      p_plan: plan,
      p_amount: expectedAmount,
      p_currency: expectedCurrency,
    });
    if (fulfillmentError || fulfilled !== true) {
      console.error("Payment fulfillment failed:", fulfillmentError?.message || "reference already used");
      return new Response(JSON.stringify({ error: "Payment reference has already been used or could not be applied" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, plan, planType: dbPlanType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
