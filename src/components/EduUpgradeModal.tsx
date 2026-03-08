import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LibraryTier } from "@/data/libraries";

interface EduUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredTier: LibraryTier;
  libraryName: string;
}

const tierLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
};

const starterFeatures = [
  "Pharmacology library",
  "Laboratory Tests library",
  "Study & Exam Prep library",
  "Short quizzes",
];

const proFeatures = [
  "Everything in Starter",
  "Clinical Case Learning",
  "Research & Evidence Basics",
  "Advanced learning dashboards",
  "Interactive AI feedback",
];

export function EduUpgradeModal({ open, onOpenChange, requiredTier, libraryName }: EduUpgradeModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="text-primary" size={24} />
          </div>
          <DialogTitle className="text-center text-xl">
            {libraryName} requires {tierLabels[requiredTier] || "an upgrade"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Upgrade to the Educational {tierLabels[requiredTier]} plan to unlock this library and more advanced learning features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {requiredTier === "starter" && (
            <div className="bg-accent/50 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Starter Plan
              </h4>
              <ul className="space-y-1.5">
                {starterFeatures.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check size={14} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requiredTier === "pro" && (
            <div className="bg-accent/50 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Pro Plan
              </h4>
              <ul className="space-y-1.5">
                {proFeatures.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check size={14} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing/education");
            }}
          >
            View Education Plans
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
