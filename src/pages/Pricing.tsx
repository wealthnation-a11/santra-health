import { Check, X, Crown, Sparkles, ArrowLeft, MessageSquare, Image, FileText, Mic, Brain, Zap, Shield, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SantraLogo } from "@/components/SantraLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaystack } from "@/hooks/usePaystack";
import { Badge } from "@/components/ui/badge";

const features = [
  { label: "Daily messages", free: "15 per day", premium: "Unlimited", icon: MessageSquare },
  { label: "AI health chat", free: true, premium: true, icon: Brain },
  { label: "Emergency detection", free: true, premium: true, icon: Shield },
  { label: "Doctor referrals", free: true, premium: true, icon: Zap },
  { label: "Lab result interpretation", free: false, premium: true, icon: FileText },
  { label: "Image analysis", free: false, premium: true, icon: Image },
  { label: "Document upload & review", free: false, premium: true, icon: FileText },
  { label: "Voice input", free: false, premium: true, icon: Mic },
  { label: "Priority AI responses", free: false, premium: true, icon: Sparkles },
  { label: "Chat export to PDF", free: false, premium: true, icon: FileText },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isLoading } = useSubscription();
  const { initiatePayment, pricing } = usePaystack();
  const { interval, setInterval, plan, annualSavingsLabel } = pricing;

  const activeTier = plan[interval];

  const handleUpgrade = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    initiatePayment(interval);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <SantraLogo size="sm" />
          </div>
          {user && (
            <Button variant="ghost" onClick={() => navigate("/chat")}>
              Back to Chat
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground mb-6">
            <Crown size={16} className="text-primary" />
            <span>Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start free and upgrade when you need more. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-full">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                interval === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                interval === "annual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                2 months free
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-1">Free</h2>
              <p className="text-muted-foreground text-sm">For getting started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  {f.free ? (
                    <Check size={16} className="text-primary flex-shrink-0" />
                  ) : (
                    <X size={16} className="text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={f.free ? "text-foreground" : "text-muted-foreground/60"}>
                    {typeof f.free === "string" ? `${f.label} — ${f.free}` : f.label}
                  </span>
                </li>
              ))}
            </ul>
            {isPremium ? (
              <Button variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate(user ? "/chat" : "/auth")}>
                {user ? "Continue Free" : "Get Started"}
              </Button>
            )}
          </div>

          {/* Premium Tier */}
          <div className="relative bg-card border-2 border-primary rounded-2xl p-8 flex flex-col shadow-santra">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
              RECOMMENDED
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                Premium
                <Crown size={20} className="text-primary" />
              </h2>
              <p className="text-muted-foreground text-sm">Full access, no limits</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">
                {activeTier.symbol}{activeTier.amount / 100}
              </span>
              <span className="text-muted-foreground">
                /{interval === "monthly" ? "month" : "year"}
              </span>
              {interval === "annual" && (
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {annualSavingsLabel}
                  </Badge>
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span className="text-foreground">
                    {typeof f.premium === "string" ? `${f.label} — ${f.premium}` : f.label}
                  </span>
                </li>
              ))}
            </ul>
            {isPremium ? (
              <Button variant="santra" disabled>
                <Check size={16} className="mr-1" />
                You're on Premium
              </Button>
            ) : (
              <Button variant="santra" size="lg" onClick={handleUpgrade} disabled={isLoading}>
                <Sparkles size={16} className="mr-1" />
                Upgrade Now — {activeTier.displayPrice}
              </Button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "How does billing work?", a: `You can choose monthly (${plan.monthly.displayPrice}) or annual (${plan.annual.displayPrice}) billing via Paystack. Annual saves you 2 months!` },
              { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription at any time from your Settings page. You'll retain premium access until your billing period ends." },
              { q: "What payment methods are accepted?", a: "We accept Visa, Mastercard, Verve, bank transfers, and mobile money through Paystack — Africa's leading payment platform." },
              { q: "Is my payment information secure?", a: "Absolutely. All payments are processed securely through Paystack. We never store your card details." },
            ].map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
