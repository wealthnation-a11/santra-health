import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminSubscriptions from "./admin/AdminSubscriptions";
import AdminConversations from "./admin/AdminConversations";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Santra Health</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => navigate("/chat")}>
            <ArrowLeft size={16} />
            Back to App
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "subscriptions" && <AdminSubscriptions />}
          {activeTab === "conversations" && <AdminConversations />}
        </div>
      </main>
    </div>
  );
}
