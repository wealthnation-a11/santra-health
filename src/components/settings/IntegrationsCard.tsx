import { Activity, Apple, Watch, Calendar, Pill, MapPin, Crown, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface Integration {
  key: string;
  name: string;
  description: string;
  icon: React.ElementType;
  premium: boolean;
}

const integrations: Integration[] = [
  { key: "google_fit", name: "Google Fit", description: "Activity, sleep & heart rate data", icon: Activity, premium: true },
  { key: "apple_health", name: "Apple Health", description: "Health & fitness data from iPhone", icon: Apple, premium: true },
  { key: "fitbit", name: "Fitbit", description: "Wearable fitness & wellness data", icon: Watch, premium: true },
  { key: "google_calendar", name: "Google Calendar", description: "Medication & appointment reminders", icon: Calendar, premium: false },
  { key: "myfitnesspal", name: "MyFitnessPal", description: "Nutrition & diet tracking", icon: Pill, premium: true },
  { key: "pharmacy_locator", name: "Pharmacy Locator", description: "Find nearby pharmacies", icon: MapPin, premium: false },
];

export function IntegrationsCard() {
  const { isPremium } = useSubscription();

  const handleConnect = (integration: Integration) => {
    toast("Coming Soon", {
      description: `${integration.name} integration is coming soon. Stay tuned!`,
    });
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 santra-gradient rounded-xl flex items-center justify-center">
          <Link size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground">Connect health apps and services</p>
        </div>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const showPremiumBadge = integration.premium && !isPremium;

          return (
            <div
              key={integration.key}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{integration.name}</p>
                    {showPremiumBadge && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
                        <Crown size={10} />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 ml-3"
                onClick={() => handleConnect(integration)}
              >
                Connect
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
