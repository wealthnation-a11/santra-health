import { AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface EmergencyBannerProps {
  onConsultDoctor: () => void;
}

export function EmergencyBanner({ onConsultDoctor }: EmergencyBannerProps) {
  return (
    <div className="bg-santra-emergency-bg border border-destructive/30 rounded-xl p-4 mx-4 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="text-destructive" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-destructive mb-1">
            ⚠️ This may be a medical emergency
          </h4>
          <p className="text-sm text-foreground/80 mb-3">
            Please seek immediate medical help. If you're experiencing severe symptoms, 
            call your local emergency services immediately.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="emergency" size="sm" onClick={onConsultDoctor}>
              <Phone size={16} />
              Talk to a Doctor Now
            </Button>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              <ExternalLink size={16} />
              Emergency Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
