import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, Image, FileText, Sparkles } from "lucide-react";
import { usePaystack } from "@/hooks/usePaystack";
import { usePricing } from "@/hooks/usePricing";

interface DailyLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dailyLimit: number;
}

const premiumFeatures = [
  { icon: MessageSquare, label: "Unlimited daily messages" },
  { icon: Image, label: "Image & document analysis" },
  { icon: FileText, label: "Export chats to PDF" },
  { icon: Sparkles, label: "Priority AI responses" },
];

export function DailyLimitModal({ open, onOpenChange, dailyLimit }: DailyLimitModalProps) {
  const { initiatePayment } = usePaystack();
  const pricing = usePricing();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
            <Zap className="w-7 h-7 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">
            Daily Limit Reached
          </DialogTitle>
          <DialogDescription className="text-center">
            You've used all {dailyLimit} free messages for today. Upgrade to Santra Premium for unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {premiumFeatures.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            variant="santra"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              initiatePayment();
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to Premium — {pricing.displayPrice}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Your limit resets at midnight. Come back tomorrow for more free messages!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
