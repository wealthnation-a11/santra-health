import { AlertCircle, Shield, Heart } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 santra-gradient rounded-2xl flex items-center justify-center mb-4 shadow-santra">
            <Heart className="text-primary-foreground" size={32} />
          </div>
          <DialogTitle className="text-2xl font-display">Welcome to Santra</DialogTitle>
          <DialogDescription className="text-base">
            Your trusted AI companion for health questions and guidance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="flex items-start gap-3 p-4 bg-accent rounded-xl">
            <Shield className="text-primary flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-foreground mb-1">Educational Information Only</h4>
              <p className="text-sm text-muted-foreground">
                Santra provides general health information for educational purposes. It does not 
                diagnose conditions, prescribe treatments, or replace professional medical advice.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent rounded-xl">
            <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-foreground mb-1">Emergency Situations</h4>
              <p className="text-sm text-muted-foreground">
                If you're experiencing a medical emergency, please call your local emergency 
                services immediately. Santra will alert you if your symptoms may require urgent care.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button variant="santra" size="lg" className="w-full" onClick={onAccept}>
            I Understand — Start Chatting
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            By continuing, you agree to our Terms of Service and acknowledge this disclaimer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
