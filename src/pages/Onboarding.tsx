import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Globe, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SantraLogo } from "@/components/SantraLogo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Brazil",
  "Japan",
  "South Africa",
  "Nigeria",
  "Kenya",
  "United Arab Emirates",
  "Singapore",
  "Other",
];

export default function Onboarding() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canSubmit = fullName.trim() && country && termsAccepted && disclaimerAccepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        country,
        terms_accepted_at: new Date().toISOString(),
        onboarding_completed: true,
      });

      if (error) {
        toast({
          title: "Failed to save profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to Santra!",
          description: "Your profile has been set up successfully.",
        });
        navigate("/chat");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <SantraLogo size="lg" />
          <p className="text-muted-foreground mt-2">A Prescribly Product</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-santra">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us personalize your health experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disclaimer Box */}
            <div className="p-4 bg-accent rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Medical Disclaimer
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Santra provides general health information for educational purposes only. 
                    It does not diagnose conditions, prescribe treatments, or replace 
                    professional medical advice from qualified healthcare providers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Emergency Situations
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    If you're experiencing a medical emergency, please call your local 
                    emergency services immediately. Santra is not designed to handle 
                    life-threatening situations.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to Santra's{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="disclaimer"
                  checked={disclaimerAccepted}
                  onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="disclaimer" className="text-sm text-muted-foreground cursor-pointer">
                  I understand that Santra provides educational health information only 
                  and does not replace professional medical advice
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="santra"
              className="w-full h-12"
              disabled={!canSubmit || loading}
            >
              {loading ? (
                "Setting up..."
              ) : (
                <>
                  <CheckCircle size={18} />
                  Complete Setup
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is secure and will only be used to personalize your experience.
        </p>
      </div>
    </div>
  );
}
