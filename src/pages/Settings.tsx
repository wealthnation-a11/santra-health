import { useState } from "react";
import { ArrowLeft, User, Bell, Shield, Moon, Sun, Monitor, Loader2, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SantraLogo } from "@/components/SantraLogo";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh",
  "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Czech Republic", "Denmark",
  "Egypt", "Finland", "France", "Germany", "Ghana", "Greece", "Hong Kong", "Hungary",
  "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kenya", "Malaysia",
  "Mexico", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru",
  "Philippines", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", "Singapore",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand",
  "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Vietnam"
];

export default function Settings() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preferences (local state for now)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!country) {
      toast.error("Please select your country");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim(), country });
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
              <ArrowLeft size={20} />
            </Button>
            <SantraLogo size="sm" />
          </div>
          <Button variant="ghost" onClick={() => navigate("/chat")}>
            Back to Chat
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

        {/* Profile Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 santra-gradient rounded-xl flex items-center justify-center">
              <User size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="santra" 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="mt-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={16} />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Palette size={20} className="text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how Santra looks</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon size={24} className={theme === option.value ? "text-primary" : "text-muted-foreground"} />
                      <span className={`text-sm font-medium ${theme === option.value ? "text-primary" : "text-foreground"}`}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                System mode automatically switches between light and dark based on your device settings.
              </p>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates and tips via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Emergency Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about health emergencies</p>
              </div>
              <Switch checked={emergencyAlerts} onCheckedChange={setEmergencyAlerts} />
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Privacy & Data</h2>
              <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium text-foreground mb-1">Your Data is Secure</p>
              <p className="text-sm text-muted-foreground">
                All conversations are encrypted and stored securely. We never share your personal 
                health information with third parties.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="font-medium text-foreground mb-1">AI Disclaimer</p>
              <p className="text-sm text-muted-foreground">
                Santra is an AI health assistant and does not replace professional medical advice. 
                Always consult a healthcare provider for medical concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            Sign Out
          </Button>
        </section>
      </main>
    </div>
  );
}