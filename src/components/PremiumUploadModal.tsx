import { Image, FileText, Mic, X, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PremiumUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumUploadModal({ open, onOpenChange }: PremiumUploadModalProps) {
  const handleSubscribe = () => {
    toast.info("Coming Soon!", {
      description: "Premium features will be available soon. Stay tuned!",
    });
    onOpenChange(false);
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
            <div className="flex items-center justify-center gap-1 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">$6</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Cancel anytime. No commitment required.
            </p>
          </div>

          <Button
            variant="santra"
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
          >
            <Crown className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By subscribing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
