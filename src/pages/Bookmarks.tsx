import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface BookmarkItem {
  id: string;
  message_id: string;
  conversation_id: string;
  created_at: string;
  message_content: string;
  conversation_title: string;
}

export default function Bookmarks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select(`
        id, message_id, conversation_id, created_at,
        messages!inner(content),
        conversations!inner(title)
      `)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Failed to load bookmarks");
    } else {
      setBookmarks(
        (data || []).map((b: any) => ({
          id: b.id,
          message_id: b.message_id,
          conversation_id: b.conversation_id,
          created_at: b.created_at,
          message_content: b.messages?.content || "",
          conversation_title: b.conversations?.title || "Untitled",
        }))
      );
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.success("Bookmark removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft size={20} />
          </Button>
          <Bookmark size={22} className="text-primary" />
          <h1 className="text-xl font-display font-bold">Saved Responses</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading bookmarks...</p>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bookmark className="mx-auto mb-3 opacity-40" size={40} />
            <p className="font-medium">No saved responses yet</p>
            <p className="text-sm mt-1">Star any AI response in chat to save it here</p>
          </div>
        ) : (
          bookmarks.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare size={14} />
                  {b.conversation_title}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(b.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                <ReactMarkdown>{b.message_content.length > 500 ? b.message_content.slice(0, 500) + "..." : b.message_content}</ReactMarkdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
