import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BannerSetting {
  enabled: boolean;
  message: string;
  variant?: "info" | "warning" | "success";
}

export function AppSettingsBanner() {
  const [banner, setBanner] = useState<BannerSetting | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "broadcast_banner")
        .maybeSingle();
      if (data?.value) setBanner(data.value as BannerSetting);
    };
    load();
    const channel = supabase
      .channel("app_settings_banner")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: "key=eq.broadcast_banner" },
        (payload: any) => {
          if (payload.new?.value) {
            setBanner(payload.new.value as BannerSetting);
            setDismissed(false);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!banner?.enabled || !banner.message || dismissed) return null;

  const variantClass =
    banner.variant === "warning"
      ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/30"
      : banner.variant === "success"
      ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-emerald-500/30"
      : "bg-primary/10 text-foreground border-primary/30";

  return (
    <div className={`w-full border-b ${variantClass}`}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
        <AlertCircle size={16} className="shrink-0" />
        <span className="flex-1">{banner.message}</span>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
