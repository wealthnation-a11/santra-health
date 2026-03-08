import { Image, FileText, Mic, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaystack } from "@/hooks/usePaystack";

interface PremiumUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumUploadModal({ open, onOpenChange }: PremiumUploadModalProps) {
  const { initiatePayment, pricing } = usePaystack();

  const handleSubscribe = (interval: "monthly" | "annual") => {
    onOpenChange(false);
    initiatePayment(interval);
  };

  const features = [
    {
      icon: Image,
      title: "Image Analysis",
      description: "Upload photos of symptoms for AI analysis",
    },
    {
      icon: FileText,
      title: "Document Review",
      description: "Share medical documents (PDF) for context",
    },
    {
      icon: Mic,
      title: "Voice Messages",
      description: "Describe symptoms using audio recordings",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Unlock Premium Features
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground text-sm">
            Get enhanced AI health assistance with multimedia support:
          </p>

          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 bg-accent/50 rounded-xl"
              >
                <div className="w-10 h-10 santra-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Starting at
            </p>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{pricing.plan.monthly.displayPrice}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              or {pricing.plan.annual.displayPrice} — {pricing.annualSavingsLabel}
            </p>
          </div>

          <Button
            variant="santra"
            className="w-full"
            size="lg"
            onClick={() => handleSubscribe("monthly")}
          >
            <Crown className="mr-2 h-4 w-4" />
            Subscribe Monthly — {pricing.plan.monthly.displayPrice}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSubscribe("annual")}
          >
            Subscribe Annually — {pricing.plan.annual.displayPrice}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By subscribing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
