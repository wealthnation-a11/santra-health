import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Mail, Ban, Trash2, Users, MessageSquare,
  CreditCard, Settings as SettingsIcon, Activity, Megaphone, Wrench,
  ToggleLeft, UserCog, Search, ShieldCheck, ShieldOff, BarChart3, Download,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SantraLogo } from "@/components/SantraLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BlockedRow { id: string; email: string; reason: string; attempted_at: string; }
interface WaitlistRow { id: string; email: string; user_id: string | null; notified: boolean; created_at: string; }
interface UserRow {
  id: string; full_name: string | null; country: string | null; created_at: string;
  onboarding_completed: boolean; banned_at?: string | null; ban_reason?: string | null;
  subscriptions?: Array<{ plan_type: string; plan: string; status: string }> | null;
}
interface ConvRow {
  id: string; title: string; library_id: string | null; created_at: string; updated_at: string;
  user_id: string; full_name: string | null; message_count: number;
}
interface SubRow {
  id: string; user_id: string; plan_type: string; plan: string; status: string;
  created_at: string; full_name: string | null; country: string | null;
}
interface AuditRow {
  id: string; admin_id: string; admin_name: string | null; action: string;
  target_id: string | null; details: any; created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // data
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [blocked, setBlocked] = useState<BlockedRow[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [engagement, setEngagement] = useState<any>(null);

  // settings
  const [banner, setBanner] = useState({ enabled: false, message: "", variant: "info" });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "" });
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [limits, setLimits] = useState<{ free_daily_messages: number; free_monthly_voice: number }>({
    free_daily_messages: 15, free_monthly_voice: 10,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      setChecking(false);
    })();
  }, [user, authLoading]);

  const loadAll = async () => {
    const [statsRes, usersRes, convRes, subRes, auditRes, b, w, settings, engRes] = await Promise.all([
      supabase.rpc("admin_get_stats"),
      supabase.rpc("admin_list_users", { _limit: 100, _offset: 0, _search: "" }),
      supabase.rpc("admin_list_conversations", { _limit: 100, _offset: 0 }),
      supabase.rpc("admin_list_subscriptions", { _limit: 100, _offset: 0, _plan_type: "", _plan: "" }),
      supabase.rpc("admin_list_audit_log", { _limit: 100 }),
      supabase.from("blocked_signups").select("*").order("attempted_at", { ascending: false }).limit(200),
      supabase.from("edu_pro_waitlist").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("app_settings").select("*"),
      supabase.rpc("admin_feature_usage_stats", { _days: 30, _limit: 100 }),
    ]);
    if (statsRes.data) setStats(statsRes.data);
    if (usersRes.data && (usersRes.data as any).users) setUsers((usersRes.data as any).users);
    if (convRes.data && (convRes.data as any).conversations) setConversations((convRes.data as any).conversations);
    if (subRes.data && (subRes.data as any).subscriptions) setSubscriptions((subRes.data as any).subscriptions);
    if (auditRes.data) setAudit(auditRes.data as any);
    if (b.data) setBlocked(b.data as BlockedRow[]);
    if (w.data) setWaitlist(w.data as WaitlistRow[]);
    if (engRes.data) setEngagement(engRes.data);
    if (settings.data) {
      for (const row of settings.data as any[]) {
        if (row.key === "broadcast_banner") setBanner(row.value);
        if (row.key === "maintenance_mode") setMaintenance(row.value);
        if (row.key === "feature_flags") setFeatures(row.value);
        if (row.key === "limits") setLimits(row.value);
      }
    }
  };

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  const searchUsers = async () => {
    const { data } = await supabase.rpc("admin_list_users", { _limit: 100, _offset: 0, _search: userSearch });
    if (data && (data as any).users) setUsers((data as any).users);
  };

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase.rpc("admin_set_setting", { _key: key, _value: value });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    loadAll();
  };

  const banUser = async (uid: string, reason: string) => {
    const { error } = await supabase.rpc("admin_ban_user", { _user_id: uid, _reason: reason });
    if (error) return toast.error(error.message);
    toast.success("User banned");
    loadAll();
  };
  const unbanUser = async (uid: string) => {
    const { error } = await supabase.rpc("admin_unban_user", { _user_id: uid });
    if (error) return toast.error(error.message);
    toast.success("User unbanned");
    loadAll();
  };
  const grantAdmin = async (uid: string) => {
    const { error } = await supabase.rpc("admin_grant_role", { _user_id: uid, _role: "admin" as any });
    if (error) return toast.error(error.message);
    toast.success("Admin granted");
    loadAll();
  };
  const revokeAdmin = async (uid: string) => {
    const { error } = await supabase.rpc("admin_revoke_role", { _user_id: uid, _role: "admin" as any });
    if (error) return toast.error(error.message);
    toast.success("Admin revoked");
    loadAll();
  };
  const setSubPlan = async (uid: string, plan_type: string, plan: string) => {
    const { error } = await supabase.rpc("admin_set_subscription", {
      _user_id: uid, _plan_type: plan_type, _plan: plan, _status: "active",
    });
    if (error) return toast.error(error.message);
    toast.success("Subscription updated");
    loadAll();
  };
  const deleteConversation = async (id: string) => {
    const { error } = await supabase.rpc("admin_delete_conversation", { _conversation_id: id });
    if (error) return toast.error(error.message);
    toast.success("Conversation deleted");
    loadAll();
  };
  const deleteBlocked = async (id: string) => {
    await supabase.from("blocked_signups").delete().eq("id", id);
    setBlocked((p) => p.filter((r) => r.id !== id));
  };
  const deleteWaitlist = async (id: string) => {
    await supabase.from("edu_pro_waitlist").delete().eq("id", id);
    setWaitlist((p) => p.filter((r) => r.id !== id));
  };

  if (authLoading || checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="text-destructive" /> Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You don't have permission to view this page.</p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full"><ArrowLeft size={16} /> Back to home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft size={16} /> Home</Button>
            <SantraLogo size="sm" />
            <Badge variant="secondary" className="gap-1"><Shield size={12} className="text-primary" /> Admin</Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Full control over Santra — users, content, subscriptions, and app settings.</p>

        {/* Stats overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users size={18} />} label="Total users" value={stats.total_users} sub={`+${stats.new_users_today} today`} />
            <StatCard icon={<MessageSquare size={18} />} label="Messages" value={stats.total_messages} sub={`+${stats.messages_today} today`} />
            <StatCard icon={<CreditCard size={18} />} label="Active subs" value={stats.total_subscriptions} sub={`Chat ${stats.chat_premium} · Edu ${stats.edu_starter + stats.edu_pro}`} />
            <StatCard icon={<Activity size={18} />} label="Conversations" value={stats.total_conversations} sub={`${stats.library_conversations} libraries`} />
          </div>
        )}

        <Tabs defaultValue="users" orientation="vertical" className="flex flex-col md:flex-row gap-6">
          <TabsList className="flex md:flex-col h-auto w-full md:w-56 shrink-0 bg-card border border-border p-2 gap-1 md:sticky md:top-20 md:self-start overflow-x-auto md:overflow-visible">
            <TabsTrigger value="users" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Users size={14} className="mr-2" /> Users</TabsTrigger>
            <TabsTrigger value="conversations" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><MessageSquare size={14} className="mr-2" /> Content</TabsTrigger>
            <TabsTrigger value="subs" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><CreditCard size={14} className="mr-2" /> Subscriptions</TabsTrigger>
            <TabsTrigger value="engagement" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><BarChart3 size={14} className="mr-2" /> Engagement</TabsTrigger>
            <TabsTrigger value="settings" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><SettingsIcon size={14} className="mr-2" /> App settings</TabsTrigger>
            <TabsTrigger value="blocked" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Ban size={14} className="mr-2" /> Blocked</TabsTrigger>
            <TabsTrigger value="waitlist" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Mail size={14} className="mr-2" /> Waitlist</TabsTrigger>
            <TabsTrigger value="audit" className="w-full justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Activity size={14} className="mr-2" /> Audit log</TabsTrigger>
          </TabsList>
          <div className="flex-1 min-w-0 space-y-4">


          {/* USERS */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by name…" value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchUsers()} className="pl-9" />
                  </div>
                  <Button size="sm" onClick={searchUsers}>Search</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Plans</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.country || "—"}</TableCell>
                        <TableCell className="text-xs">
                          {u.subscriptions?.map((s, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">{s.plan_type}:{s.plan}</Badge>
                          )) || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {u.banned_at ? <Badge variant="destructive">Banned</Badge> : <Badge variant="outline">Active</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <UserActions
                            user={u}
                            onBan={banUser} onUnban={unbanUser}
                            onGrantAdmin={grantAdmin} onRevokeAdmin={revokeAdmin}
                            onSetSub={setSubPlan}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONVERSATIONS */}
          <TabsContent value="conversations">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Library</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium max-w-xs truncate">{c.title}</TableCell>
                        <TableCell className="text-sm">{c.full_name || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.library_id || "general"}</TableCell>
                        <TableCell>{c.message_count}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <ConfirmAction
                            title="Delete conversation?"
                            description="This will delete the conversation and all its messages. Cannot be undone."
                            onConfirm={() => deleteConversation(c.id)}
                          >
                            <Button size="icon" variant="ghost"><Trash2 size={14} /></Button>
                          </ConfirmAction>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBSCRIPTIONS */}
          <TabsContent value="subs">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.full_name || s.user_id.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline">{s.plan_type}</Badge></TableCell>
                        <TableCell><Badge>{s.plan}</Badge></TableCell>
                        <TableCell className="text-sm">{s.status}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.country || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APP SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            {/* Broadcast banner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Megaphone size={18} className="text-primary" /> Broadcast banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show banner site-wide</Label>
                  <Switch checked={banner.enabled} onCheckedChange={(v) => setBanner({ ...banner, enabled: v })} />
                </div>
                <Textarea placeholder="Announcement message…" value={banner.message}
                  onChange={(e) => setBanner({ ...banner, message: e.target.value })} />
                <Select value={banner.variant} onValueChange={(v) => setBanner({ ...banner, variant: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info (teal)</SelectItem>
                    <SelectItem value="warning">Warning (amber)</SelectItem>
                    <SelectItem value="success">Success (green)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => saveSetting("broadcast_banner", banner)}>Save banner</Button>
              </CardContent>
            </Card>

            {/* Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Wrench size={18} className="text-primary" /> Maintenance mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable maintenance mode</Label>
                    <p className="text-xs text-muted-foreground">Non-admin users will see a maintenance screen.</p>
                  </div>
                  <Switch checked={maintenance.enabled} onCheckedChange={(v) => setMaintenance({ ...maintenance, enabled: v })} />
                </div>
                <Textarea placeholder="Maintenance message" value={maintenance.message}
                  onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })} />
                <Button onClick={() => saveSetting("maintenance_mode", maintenance)}>Save</Button>
              </CardContent>
            </Card>

            {/* Feature flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ToggleLeft size={18} className="text-primary" /> Feature toggles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(features).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <Label className="capitalize">{k.replace(/_/g, " ")}</Label>
                    <Switch checked={!!v} onCheckedChange={(val) => setFeatures({ ...features, [k]: val })} />
                  </div>
                ))}
                <Button onClick={() => saveSetting("feature_flags", features)}>Save toggles</Button>
              </CardContent>
            </Card>

            {/* Limits */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Free tier limits</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Free daily messages</Label>
                  <Input type="number" value={limits.free_daily_messages}
                    onChange={(e) => setLimits({ ...limits, free_daily_messages: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Free monthly voice transcriptions</Label>
                  <Input type="number" value={limits.free_monthly_voice}
                    onChange={(e) => setLimits({ ...limits, free_monthly_voice: Number(e.target.value) })} />
                </div>
                <Button onClick={() => saveSetting("limits", limits)}>Save limits</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BLOCKED */}
          <TabsContent value="blocked">
            <Card>
              <CardContent className="p-0">
                {blocked.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No blocked sign-ups.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Email</TableHead><TableHead>Reason</TableHead><TableHead>When</TableHead><TableHead className="w-12"></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {blocked.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(r.attempted_at).toLocaleString()}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" onClick={() => deleteBlocked(r.id)}><Trash2 size={14} /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* WAITLIST */}
          <TabsContent value="waitlist">
            <Card>
              <CardContent className="p-0">
                {waitlist.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No waitlist signups.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead className="w-12"></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {waitlist.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" onClick={() => deleteWaitlist(r.id)}><Trash2 size={14} /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENGAGEMENT */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<Activity size={18} />} label="First Aid views (30d)" value={engagement?.totals?.first_aid ?? 0} />
              <StatCard icon={<Activity size={18} />} label="Health Tool uses (30d)" value={engagement?.totals?.health_tool ?? 0} />
              <StatCard icon={<Activity size={18} />} label="Library opens (30d)" value={engagement?.totals?.library ?? 0} />
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Top items (30 days)</CardTitle></CardHeader>
              <CardContent className="p-0">
                {(!engagement?.by_item || engagement.by_item.length === 0) ? (
                  <p className="p-6 text-sm text-muted-foreground">No usage tracked yet.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Feature</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Count</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {engagement.by_item.map((i: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell><Badge variant="outline">{i.feature}</Badge></TableCell>
                          <TableCell className="text-sm">{i.item_key}</TableCell>
                          <TableCell className="text-right font-medium">{i.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Library chats (30 days)</CardTitle></CardHeader>
              <CardContent className="p-0">
                {(!engagement?.library_conversations || engagement.library_conversations.length === 0) ? (
                  <p className="p-6 text-sm text-muted-foreground">No library conversations yet.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Library</TableHead><TableHead className="text-right">Conversations</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {engagement.library_conversations.map((l: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm">{l.library_id}</TableCell>
                          <TableCell className="text-right font-medium">{l.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Recent activity</CardTitle></CardHeader>
              <CardContent className="p-0">
                {(!engagement?.recent || engagement.recent.length === 0) ? (
                  <p className="p-6 text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>User</TableHead><TableHead>Feature</TableHead><TableHead>Item</TableHead><TableHead>When</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {engagement.recent.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">{r.full_name || "—"}</TableCell>
                          <TableCell><Badge variant="outline">{r.feature}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.item_key || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardContent className="p-0">
                {audit.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No actions logged yet.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Admin</TableHead><TableHead>Action</TableHead><TableHead>Target</TableHead><TableHead>Details</TableHead><TableHead>When</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {audit.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">{a.admin_name || a.admin_id.slice(0, 8)}</TableCell>
                          <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">{a.target_id?.slice(0, 12) || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{a.details ? JSON.stringify(a.details) : "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: any; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value ?? 0}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfirmAction({
  title, description, onConfirm, children,
}: { title: string; description: string; onConfirm: () => void; children: React.ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UserActions({
  user, onBan, onUnban, onGrantAdmin, onRevokeAdmin, onSetSub,
}: {
  user: UserRow;
  onBan: (id: string, reason: string) => void;
  onUnban: (id: string) => void;
  onGrantAdmin: (id: string) => void;
  onRevokeAdmin: (id: string) => void;
  onSetSub: (id: string, plan_type: string, plan: string) => void;
}) {
  const [banReason, setBanReason] = useState("");
  return (
    <div className="flex items-center gap-1 justify-end">
      <Select onValueChange={(v) => {
        const [pt, p] = v.split(":");
        onSetSub(user.id, pt, p);
      }}>
        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Set plan" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="chat:free">Chat: Free</SelectItem>
          <SelectItem value="chat:premium">Chat: Premium</SelectItem>
          <SelectItem value="edu:free">Edu: Free</SelectItem>
          <SelectItem value="edu:starter">Edu: Starter</SelectItem>
          <SelectItem value="edu:pro">Edu: Pro</SelectItem>
        </SelectContent>
      </Select>

      <ConfirmAction title="Grant admin role?" description="This user will gain full admin access."
        onConfirm={() => onGrantAdmin(user.id)}>
        <Button size="icon" variant="ghost" title="Grant admin"><ShieldCheck size={14} /></Button>
      </ConfirmAction>
      <ConfirmAction title="Revoke admin role?" description="This user will lose admin access."
        onConfirm={() => onRevokeAdmin(user.id)}>
        <Button size="icon" variant="ghost" title="Revoke admin"><ShieldOff size={14} /></Button>
      </ConfirmAction>

      {user.banned_at ? (
        <Button size="sm" variant="outline" onClick={() => onUnban(user.id)}>Unban</Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" title="Ban user"><Ban size={14} className="text-destructive" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ban user?</AlertDialogTitle>
              <AlertDialogDescription>Provide a reason for the ban (optional).</AlertDialogDescription>
            </AlertDialogHeader>
            <Input placeholder="Reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onBan(user.id, banReason)}>Ban</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
