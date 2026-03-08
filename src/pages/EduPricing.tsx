import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SantraLogo } from "@/components/SantraLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useEduSubscription } from "@/hooks/useEduSubscription";
import { usePaystack } from "@/hooks/usePaystack";
import { getEduPricingForCountry } from "@/data/eduPricing";
import type { BillingInterval } from "@/data/pricing";

export default function EduPricing() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { eduPlan } = useEduSubscription();
  const { initiatePayment } = usePaystack();
  const [interval, setInterval] = useState<EduBillingInterval>("monthly");

  const pricing = getEduPricingForCountry(profile?.country);
  const starterTier = pricing.starter[interval];
  const proTier = pricing.pro[interval];

  const handleUpgrade = (plan: "edu_starter" | "edu_pro") => {
    const tier = plan === "edu_starter" ? pricing.starter : pricing.pro;
    initiatePayment(interval, "edu", plan, tier[interval].amount, tier[interval].currency);
  };

  const starterFeatures = [
    "AI-assisted learning tutorials",
    "1–2 sample lab reports per month",
    "Basic learning dashboard",
    "Short quizzes",
    "Pharmacology library",
    "Laboratory Tests library",
    "Study & Exam Prep library",
  ];

  const proFeatures = [
    "Everything in Starter",
    "Unlimited lab report uploads",
    "Case studies & simulated patients",
    "Interactive AI feedback",
    "Advanced learning dashboards",
    "Quizzes & challenges",
    "Clinical Case Learning library",
    "Research & Evidence Basics library",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/libraries")}>
            <ArrowLeft size={20} />
          </Button>
          <SantraLogo size="sm" />
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Educational Plans
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock advanced learning libraries, case studies, and AI-powered educational tools.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium ${interval === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch
            checked={interval === "annual"}
            onCheckedChange={(checked) => setInterval(checked ? "annual" : "monthly")}
          />
          <span className={`text-sm font-medium ${interval === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {interval === "annual" && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              2 months free
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starter */}
          <div className="border border-border rounded-2xl p-6 bg-card relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="font-bold text-lg">Starter</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {starterTier.displayPrice}
            </p>
            {interval === "annual" && (
              <p className="text-xs text-primary mb-4">{pricing.starter.annualSavingsLabel}</p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              For students casually exploring AI-powered medical learning.
            </p>
            <ul className="space-y-2.5 mb-8">
              {starterFeatures.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <Check size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={eduPlan === "edu_starter" ? "outline" : "default"}
              disabled={eduPlan === "edu_starter" || eduPlan === "edu_pro"}
              onClick={() => handleUpgrade("edu_starter")}
            >
              {eduPlan === "edu_starter" || eduPlan === "edu_pro" ? "Current Plan" : "Get Starter"}
            </Button>
          </div>

          {/* Pro */}
          <div className="border-2 border-primary rounded-2xl p-6 bg-card relative">
            <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={18} className="text-primary" />
              <h3 className="font-bold text-lg">Pro</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              {proTier.displayPrice}
            </p>
            {interval === "annual" && (
              <p className="text-xs text-primary mb-4">{pricing.pro.annualSavingsLabel}</p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              For serious learners who want the full AI tutoring experience.
            </p>
            <ul className="space-y-2.5 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <Check size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              disabled={eduPlan === "edu_pro"}
              onClick={() => handleUpgrade("edu_pro")}
            >
              {eduPlan === "edu_pro" ? "Current Plan" : "Get Pro"}
            </Button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
}
