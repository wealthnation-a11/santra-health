import { Crown, Sparkles, CreditCard, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaystack } from "@/hooks/usePaystack";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function SubscriptionCard() {
  const { plan, isPremium, isLoading } = useSubscription();
  const { initiatePayment } = usePaystack();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6 mb-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPremium ? "santra-gradient" : "bg-accent"}`}>
          <Crown size={20} className={isPremium ? "text-primary-foreground" : "text-accent-foreground"} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
            <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "santra-gradient text-primary-foreground border-0" : ""}>
              {isPremium ? "Premium" : "Free"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
        </div>
      </div>

      {isPremium ? (
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Santra Premium</p>
                <p className="text-xs text-muted-foreground">$6/month • Billed via Paystack</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Active Subscription</p>
                <p className="text-xs text-muted-foreground">You have full access to all premium features</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/pricing")}>
              <ExternalLink size={14} className="mr-1" />
              View Plans
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            To manage your billing or cancel, please contact support.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-xl p-4">
            <p className="text-sm text-foreground mb-1 font-medium">You're on the Free plan</p>
            <p className="text-xs text-muted-foreground">
              15 messages per day • No lab interpretation • No file uploads
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
              <span className="font-semibold text-foreground">Upgrade to Premium</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Unlock unlimited messages, lab result interpretation, image analysis, and more for just $6/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="santra" size="sm" onClick={initiatePayment}>
                <Crown size={14} className="mr-1" />
                Upgrade — $6/mo
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/pricing")}>
                Compare Plans
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Payments are securely processed via Paystack. Cancel anytime.
          </p>
        </div>
      )}
    </section>
  );
}
