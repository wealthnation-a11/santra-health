import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Mail, Ban, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SantraLogo } from "@/components/SantraLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlockedRow {
  id: string;
  email: string;
  reason: string;
  attempted_at: string;
}

interface WaitlistRow {
  id: string;
  email: string;
  user_id: string | null;
  notified: boolean;
  created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocked, setBlocked] = useState<BlockedRow[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setChecking(false);
    })();
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    const [b, w] = await Promise.all([
      supabase.from("blocked_signups").select("*").order("attempted_at", { ascending: false }).limit(200),
      supabase.from("edu_pro_waitlist").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (b.data) setBlocked(b.data as BlockedRow[]);
    if (w.data) setWaitlist(w.data as WaitlistRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  const deleteBlocked = async (id: string) => {
    const { error } = await supabase.from("blocked_signups").delete().eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setBlocked((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteWaitlist = async (id: string) => {
    const { error } = await supabase.from("edu_pro_waitlist").delete().eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    setWaitlist((prev) => prev.filter((r) => r.id !== id));
  };

  if (authLoading || checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-destructive" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have permission to view this page. Admin access only.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <ArrowLeft size={16} /> Back to home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Top blocked domains summary
  const domainCounts = blocked.reduce<Record<string, number>>((acc, r) => {
    const d = r.email.includes("@") ? r.email.split("@")[1] : "unknown";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft size={16} /> Home
            </Button>
            <SantraLogo size="sm" />
            <Badge variant="secondary" className="gap-1">
              <Shield size={12} className="text-primary" /> Admin
            </Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Review failed registrations and Edu Pro waitlist signups.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Ban size={18} className="text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blocked.length}</p>
                  <p className="text-xs text-muted-foreground">Blocked sign-ups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{waitlist.length}</p>
                  <p className="text-xs text-muted-foreground">Edu Pro waitlist</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-2">Top blocked domains</p>
              {topDomains.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet</p>
              ) : (
                <ul className="space-y-1">
                  {topDomains.map(([d, c]) => (
                    <li key={d} className="flex justify-between text-sm">
                      <span className="text-foreground truncate">{d}</span>
                      <span className="text-muted-foreground ml-2">{c}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="blocked">
          <TabsList>
            <TabsTrigger value="blocked"><Ban size={14} className="mr-1.5" /> Blocked Sign-ups</TabsTrigger>
            <TabsTrigger value="waitlist"><Mail size={14} className="mr-1.5" /> Pro Waitlist</TabsTrigger>
          </TabsList>

          <TabsContent value="blocked" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <p className="p-6 text-sm text-muted-foreground">Loading…</p>
                ) : blocked.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No blocked sign-ups yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocked.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.email}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{r.reason}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(r.attempted_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => deleteBlocked(r.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <p className="p-6 text-sm text-muted-foreground">Loading…</p>
                ) : waitlist.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No waitlist signups yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Linked user</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.email}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {r.user_id ? r.user_id.slice(0, 8) + "…" : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(r.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => deleteWaitlist(r.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
