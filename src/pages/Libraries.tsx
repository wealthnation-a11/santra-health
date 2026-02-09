import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Heart, Activity, Pill, TestTube, FileText, GraduationCap, Search, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SantraLogo } from "@/components/SantraLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { libraries } from "@/data/libraries";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Heart,
  Activity,
  Pill,
  TestTube,
  FileText,
  GraduationCap,
  Search,
};

export default function Libraries() {
  const navigate = useNavigate();

  const handleLibrarySelect = (libraryId: string) => {
    navigate(`/library/${libraryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
          >
            <ArrowLeft size={20} />
          </Button>
          <SantraLogo size="sm" />
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Learning Libraries
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select a library to start an educational chat session. Each library is context-locked 
            to provide focused, relevant information for your learning.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-primary">Educational Mode:</span> All libraries provide 
            health education only and do not replace professional medical advice.
          </p>
        </div>

        {/* Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libraries.map((library) => {
            const IconComponent = iconMap[library.icon] || BookOpen;
            return (
              <button
                key={library.id}
                onClick={() => handleLibrarySelect(library.id)}
                className="group p-6 bg-card border border-border rounded-xl text-left hover:border-primary/50 hover:shadow-santra transition-all duration-200"
              >
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

        {/* Footer CTA */}
        <div className="text-center mt-10">
          <Button
            variant="santra-outline"
            onClick={() => navigate("/chat")}
          >
            <ArrowLeft size={16} />
            Back to General Chat
          </Button>
        </div>
      </main>
    </div>
  );
}
