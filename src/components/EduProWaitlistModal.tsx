import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRO_FEATURES = [
  "Everything in Starter",
  "Unlimited lab report uploads",
  "Case studies & simulated patients",
  "Interactive AI feedback",
  "Advanced learning dashboards",
  "Clinical Case Learning library",
  "Research & Evidence Basics library",
];

export function EduProWaitlistModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("edu_pro_waitlist")
      .insert({ email: value, user_id: user?.id ?? null });
    setLoading(false);

    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast({ title: "Couldn't join waitlist", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "You're on the list!", description: "We'll email you when Edu Pro launches." });
  };

  const handleClose = (next: boolean) => {
    if (!next) setSubmitted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown size={18} className="text-primary" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles size={10} className="text-primary" /> Coming Soon
            </Badge>
          </div>
          <DialogTitle className="text-xl">Edu Pro is on the way</DialogTitle>
          <DialogDescription>
            The full AI tutoring experience for serious learners. Join the waitlist and we'll email you the moment it goes live.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="text-sm flex items-start gap-2">
              <Check size={15} className="text-primary mt-0.5 shrink-0" />
              <span className="text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        {submitted ? (
          <div className="rounded-xl bg-accent p-4 text-center">
            <Check size={22} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">You're on the list!</p>
            <p className="text-xs text-muted-foreground mt-1">We'll let you know as soon as Edu Pro is ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Joining..." : "Notify me at launch"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">No payment required. We'll only email you about Edu Pro.</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
