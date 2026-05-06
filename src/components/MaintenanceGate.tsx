import { useEffect, useState, type ReactNode } from "react";
import { Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SantraLogo } from "@/components/SantraLogo";

interface MaintenanceSetting {
  enabled: boolean;
  message: string;
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<MaintenanceSetting | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [m, u] = await Promise.all([
        supabase.from("app_settings").select("value").eq("key", "maintenance_mode").maybeSingle(),
        supabase.auth.getUser(),
      ]);
      if (m.data?.value) setSetting(m.data.value as unknown as MaintenanceSetting);
      if (u.data.user) {
        const { data: r } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!r);
      }
      setLoaded(true);
    };
    load();
    const channel = supabase
      .channel("app_settings_maint")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: "key=eq.maintenance_mode" },
        (payload: any) => {
          if (payload.new?.value) setSetting(payload.new.value as unknown as MaintenanceSetting);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!loaded) return <>{children}</>;
  if (!setting?.enabled || isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <SantraLogo size="md" />
        </div>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Wrench className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          We'll be right back
        </h1>
        <p className="text-muted-foreground">{setting.message}</p>
      </div>
    </div>
  );
}
