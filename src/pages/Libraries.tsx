import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Activity, Pill, TestTube, FileText, GraduationCap, Search, Lock, Crown, Sparkles, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SantraLogo } from "@/components/SantraLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EduUpgradeModal } from "@/components/EduUpgradeModal";
import { useEduSubscription } from "@/hooks/useEduSubscription";
import { libraries, type LibraryTier } from "@/data/libraries";

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Heart, Activity, Pill, TestTube, FileText, GraduationCap, Search,
};

const tierBadge: Record<LibraryTier, { label: string; icon: LucideIcon; className: string } | null> = {
  free: null,
  starter: { label: "Starter", icon: Sparkles, className: "bg-primary/10 text-primary border-primary/20" },
  pro: { label: "Pro", icon: Crown, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
};

export default function Libraries() {
  const navigate = useNavigate();
  const { isEduStarter, isEduPro } = useEduSubscription();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; tier: LibraryTier; name: string }>({
    open: false, tier: "starter", name: "",
  });

  const canAccess = (tier: LibraryTier) => {
    if (tier === "free") return true;
    if (tier === "starter") return isEduStarter; // isEduStarter is true for starter OR pro
    if (tier === "pro") return isEduPro;
    return false;
  };

  const handleLibrarySelect = (libraryId: string) => {
    const lib = libraries.find(l => l.id === libraryId);
    if (!lib) return;

    if (!canAccess(lib.tier)) {
      setUpgradeModal({ open: true, tier: lib.tier, name: lib.name });
      return;
    }

    navigate(`/library/${libraryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft size={20} />
          </Button>
          <SantraLogo size="sm" />
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Learning Libraries
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select a library to start an educational chat session. Each library is context-locked 
            to provide focused, relevant information for your learning.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-primary">Educational Mode:</span> All libraries provide 
            health education only and do not replace professional medical advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libraries.map((library) => {
            const IconComponent = iconMap[library.icon] || BookOpen;
            const badge = tierBadge[library.tier];
            const locked = !canAccess(library.tier);

            return (
              <button
                key={library.id}
                onClick={() => handleLibrarySelect(library.id)}
                className={`group p-6 bg-card border border-border rounded-xl text-left hover:border-primary/50 hover:shadow-santra transition-all duration-200 relative ${locked ? "opacity-80" : ""}`}
              >
                {badge && (
                  <Badge variant="outline" className={`absolute top-3 right-3 text-[10px] gap-1 ${badge.className}`}>
                    {locked && <Lock size={10} />}
                    <badge.icon size={10} />
                    {badge.label}
                  </Badge>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${library.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {library.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {library.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Education plans CTA */}
        <div className="text-center mt-8 space-y-3">
          <Button
            variant="default"
            onClick={() => navigate("/pricing/education")}
            className="gap-2"
          >
            <Sparkles size={16} />
            View Education Plans
          </Button>
          <div>
            <Button
              variant="santra-outline"
              onClick={() => navigate("/chat")}
            >
              <ArrowLeft size={16} />
              Back to General Chat
            </Button>
          </div>
        </div>
      </main>

      <EduUpgradeModal
        open={upgradeModal.open}
        onOpenChange={(open) => setUpgradeModal(prev => ({ ...prev, open }))}
        requiredTier={upgradeModal.tier}
        libraryName={upgradeModal.name}
      />
    </div>
  );
}
