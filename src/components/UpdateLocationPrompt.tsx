import { useState } from "react";
import { X, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { countries, getStatesByCountry } from "@/data/countries";

interface UpdateLocationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateLocationPrompt({ open, onOpenChange }: UpdateLocationPromptProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [country, setCountry] = useState(profile?.country || "");
  const [state, setState] = useState(profile?.state || "");
  const [loading, setLoading] = useState(false);

  const availableStates = country ? getStatesByCountry(country) : [];
  const canSubmit = country && state;

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setState("");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const { error } = await updateProfile({
        country,
        state,
      });

      if (error) {
        toast({
          title: "Failed to update location",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location updated!",
          description: "Your profile has been updated successfully.",
        });
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            Update Your Location
          </DialogTitle>
          <DialogDescription>
            Please add your country and state/region to help us personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <Globe size={14} className="text-primary" />
              Country
            </Label>
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              State / Region
            </Label>
            <Select 
              value={state} 
              onValueChange={setState}
              disabled={!country}
            >
              <SelectTrigger>
                <SelectValue placeholder={country ? "Select your state/region" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Later
          </Button>
          <Button
            variant="santra"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? "Saving..." : "Update Location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
