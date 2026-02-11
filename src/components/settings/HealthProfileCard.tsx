import { useState, useEffect } from "react";
import { Heart, Plus, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function HealthProfileCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [bloodType, setBloodType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAllergies(data.allergies || []);
        setConditions(data.conditions || []);
        setMedications(data.medications || []);
        setBloodType(data.blood_type || "");
        setHeightCm(data.height_cm?.toString() || "");
        setWeightKg(data.weight_kg?.toString() || "");
      }
    } catch (err) {
      console.error("Error fetching health profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        allergies,
        conditions,
        medications,
        blood_type: bloodType || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
      };

      const { error } = await supabase
        .from("health_profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) throw error;
      setSaved(true);
      toast.success("Health profile saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving health profile:", err);
      toast.error("Failed to save health profile");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setter((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    inputSetter("");
  };

  const removeItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((item) => item !== value));
  };

  if (loading) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
          <Heart size={20} className="text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Health Profile</h2>
          <p className="text-sm text-muted-foreground">
            Help Santra give you more personalized guidance
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Allergies */}
        <TagInput
          label="Allergies"
          placeholder="e.g. Penicillin, Peanuts"
          items={allergies}
          value={newAllergy}
          onChange={setNewAllergy}
          onAdd={() => addItem(newAllergy, setAllergies, setNewAllergy)}
          onRemove={(v) => removeItem(v, setAllergies)}
        />

        {/* Conditions */}
        <TagInput
          label="Existing Conditions"
          placeholder="e.g. Diabetes, Asthma"
          items={conditions}
          value={newCondition}
          onChange={setNewCondition}
          onAdd={() => addItem(newCondition, setConditions, setNewCondition)}
          onRemove={(v) => removeItem(v, setConditions)}
        />

        {/* Medications */}
        <TagInput
          label="Current Medications"
          placeholder="e.g. Metformin, Lisinopril"
          items={medications}
          value={newMedication}
          onChange={setNewMedication}
          onAdd={() => addItem(newMedication, setMedications, setNewMedication)}
          onRemove={(v) => removeItem(v, setMedications)}
        />

        {/* Blood Type */}
        <div>
          <Label>Blood Type</Label>
          <Select value={bloodType} onValueChange={setBloodType}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPES.map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="170"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="70"
              className="mt-1.5"
            />
          </div>
        </div>

        <Button variant="santra" onClick={handleSave} disabled={saving} className="mt-2">
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check size={16} /> Saved</>
          ) : (
            "Save Health Profile"
          )}
        </Button>
      </div>
    </section>
  );
}

function TagInput({
  label,
  placeholder,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
        />
        <Button type="button" variant="outline" size="icon" onClick={onAdd}>
          <Plus size={16} />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {item}
              <button onClick={() => onRemove(item)} className="hover:text-destructive">
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
