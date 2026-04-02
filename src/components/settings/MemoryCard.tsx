import { useState, useEffect } from "react";
import { Brain, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Memory {
  id: string;
  memory_text: string;
  category: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  symptom: "bg-destructive/10 text-destructive",
  medication: "bg-primary/10 text-primary",
  condition: "bg-orange-500/10 text-orange-600",
  allergy: "bg-red-500/10 text-red-600",
  lifestyle: "bg-emerald-500/10 text-emerald-600",
  goal: "bg-blue-500/10 text-blue-600",
  family_history: "bg-purple-500/10 text-purple-600",
  general: "bg-muted text-muted-foreground",
};

export function MemoryCard() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setMemories((data as Memory[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_memory").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete memory");
      return;
    }
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success("Memory removed");
  };

  const handleClearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_memory").delete().eq("user_id", user.id);
    if (error) {
      toast.error("Failed to clear memories");
      return;
    }
    setMemories([]);
    toast.success("All memories cleared");
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Memory</h2>
            <p className="text-sm text-muted-foreground">What Santra remembers about you</p>
          </div>
        </div>
        {memories.length > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            No memories yet. As you chat with Santra, important health facts will be remembered here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => (
            <div key={memory.id} className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={categoryColors[memory.category] || categoryColors.general}>
                    {memory.category.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-foreground">{memory.memory_text}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(memory.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
