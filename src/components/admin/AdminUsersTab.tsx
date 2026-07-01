import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search, Ban, ShieldCheck, ShieldOff, Trash2, Mail, KeyRound, LogOut,
  UserCog, ChevronLeft, ChevronRight, ArrowUpDown, Eye, Loader2, Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserRow {
  id: string;
  full_name: string | null;
  email?: string | null;
  country: string | null;
  signup_country?: string | null;
  state?: string | null;
  gender?: string | null;
  created_at: string;
  onboarding_completed: boolean;
  banned_at?: string | null;
  ban_reason?: string | null;
  preferred_language?: string | null;
  daily_message_limit_override?: number | null;
  monthly_voice_limit_override?: number | null;
  subscriptions?: Array<{ plan_type: string; plan: string; status: string }> | null;
}

const PAGE_SIZE = 25;

export function AdminUsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"created_at" | "full_name" | "country">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [countries, setCountries] = useState<string[]>([]);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users_v2" as any, {
      _limit: PAGE_SIZE,
      _offset: page * PAGE_SIZE,
      _search: search,
      _country: country === "all" ? "" : country,
      _plan: plan === "all" ? "" : plan,
      _status: status === "all" ? "" : status,
      _sort: sort,
      _sort_dir: sortDir,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    const d = data as any;
    setUsers(d?.users || []);
    setTotal(d?.total || 0);
  }, [page, search, country, plan, status, sort, sortDir]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    supabase.rpc("admin_user_countries" as any).then(({ data }) => {
      if (Array.isArray(data)) setCountries(data as string[]);
    });
  }, []);

  const toggleSort = (col: typeof sort) => {
    if (sort === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSort(col); setSortDir("asc"); }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={country} onValueChange={(v) => { setCountry(v); setPage(0); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={plan} onValueChange={(v) => { setPlan(v); setPage(0); }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Plan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Chat Premium</SelectItem>
              <SelectItem value="starter">Edu Starter</SelectItem>
              <SelectItem value="pro">Edu Pro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="onboarded">Onboarded</SelectItem>
              <SelectItem value="not_onboarded">Not onboarded</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground">
            {total} user{total === 1 ? "" : "s"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button className="inline-flex items-center gap-1" onClick={() => toggleSort("full_name")}>
                  Name <ArrowUpDown size={12} />
                </button>
              </TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1" onClick={() => toggleSort("country")}>
                  Country <ArrowUpDown size={12} />
                </button>
              </TableHead>
              <TableHead>Plans</TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1" onClick={() => toggleSort("created_at")}>
                  Joined <ArrowUpDown size={12} />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                <Loader2 className="inline animate-spin" size={16} /> Loading…
              </TableCell></TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users</TableCell></TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailUser(u)}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.country || u.signup_country || "—"}</TableCell>
                <TableCell className="text-xs">
                  {u.subscriptions?.length ? u.subscriptions.map((s, i) => (
                    <Badge key={i} variant="secondary" className="mr-1">{s.plan_type}:{s.plan}</Badge>
                  )) : <span className="text-muted-foreground">free</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {u.banned_at
                    ? <Badge variant="destructive">Banned</Badge>
                    : !u.onboarding_completed
                      ? <Badge variant="outline">Pending</Badge>
                      : <Badge variant="outline">Active</Badge>}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => setDetailUser(u)}>
                    <Eye size={14} className="mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </CardContent>

      {detailUser && (
        <UserDetailDrawer
          user={detailUser}
          open={!!detailUser}
          onOpenChange={(o) => !o && setDetailUser(null)}
          onChanged={load}
        />
      )}
    </Card>
  );
}

function UserDetailDrawer({
  user, open, onOpenChange, onChanged,
}: {
  user: UserRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // editable fields
  const [fullName, setFullName] = useState(user.full_name || "");
  const [country, setCountry] = useState(user.country || "");
  const [stateField, setStateField] = useState(user.state || "");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState(user.preferred_language || "en");
  const [gender, setGender] = useState(user.gender || "");
  const [notes, setNotes] = useState("");
  const [dailyLimit, setDailyLimit] = useState<string>(user.daily_message_limit_override?.toString() ?? "");
  const [voiceLimit, setVoiceLimit] = useState<string>(user.monthly_voice_limit_override?.toString() ?? "");
  const [banReason, setBanReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase.rpc("admin_user_detail" as any, { _user_id: user.id }).then(({ data, error }) => {
      setLoading(false);
      if (error) return toast.error(error.message);
      setDetail(data);
      const p = (data as any)?.profile;
      if (p) {
        setFullName(p.full_name || "");
        setCountry(p.country || "");
        setStateField(p.state || "");
        setPhone(p.phone || "");
        setLang(p.preferred_language || "en");
        setGender(p.gender || "");
        setNotes(p.admin_notes || "");
        setDailyLimit(p.daily_message_limit_override?.toString() ?? "");
        setVoiceLimit(p.monthly_voice_limit_override?.toString() ?? "");
      }
    });
  }, [user.id]);

  const isAdmin = useMemo(() => (detail?.roles || []).includes("admin"), [detail]);

  const callAction = async (action: string, extra?: Record<string, unknown>) => {
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("admin-user-actions", {
        body: { action, user_id: user.id, ...(extra || {}) },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async () => {
    setBusy("save");
    const { error } = await supabase.rpc("admin_update_profile" as any, {
      _user_id: user.id,
      _full_name: fullName || null,
      _country: country || null,
      _state: stateField || null,
      _phone: phone || null,
      _preferred_language: lang || null,
      _gender: gender || null,
      _admin_notes: notes || null,
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    onChanged();
  };

  const saveLimits = async () => {
    setBusy("limits");
    const { error } = await supabase.rpc("admin_set_user_limits" as any, {
      _user_id: user.id,
      _daily_messages: dailyLimit ? parseInt(dailyLimit, 10) : null,
      _monthly_voice: voiceLimit ? parseInt(voiceLimit, 10) : null,
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Limits updated");
    onChanged();
  };

  const banAct = async () => {
    setBusy("ban");
    const { error } = await supabase.rpc("admin_ban_user", { _user_id: user.id, _reason: banReason || null });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("User banned");
    onChanged();
    onOpenChange(false);
  };

  const unbanAct = async () => {
    const { error } = await supabase.rpc("admin_unban_user", { _user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Unbanned"); onChanged(); onOpenChange(false);
  };

  const roleAct = async (grant: boolean) => {
    const fn = grant ? "admin_grant_role" : "admin_revoke_role";
    const { error } = await supabase.rpc(fn, { _user_id: user.id, _role: "admin" as any });
    if (error) return toast.error(error.message);
    toast.success(grant ? "Admin granted" : "Admin revoked");
    onChanged();
  };

  const passwordReset = async () => {
    const data = await callAction("send_password_reset", { redirect_to: `${window.location.origin}/reset-password` });
    if (data?.action_link) {
      await navigator.clipboard.writeText(data.action_link as string);
      toast.success("Recovery link copied to clipboard");
    }
  };

  const magicLink = async () => {
    const data = await callAction("send_magic_link", { redirect_to: window.location.origin });
    if (data?.action_link) {
      await navigator.clipboard.writeText(data.action_link as string);
      toast.success("Magic link copied to clipboard");
    }
  };

  const impersonate = async () => {
    const data = await callAction("impersonate", { redirect_to: window.location.origin });
    if (data?.action_link) {
      await navigator.clipboard.writeText(data.action_link as string);
      toast.success("Impersonation link copied — open in a private window");
    }
  };

  const forceSignout = async () => {
    const data = await callAction("force_signout");
    if (data) toast.success("All sessions revoked");
  };

  const deleteAccount = async () => {
    const data = await callAction("delete_user");
    if (data) {
      toast.success("User deleted");
      onChanged();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCog size={18} /> {user.full_name || "User"}
            {isAdmin && <Badge variant="secondary"><ShieldCheck size={10} className="mr-1" /> Admin</Badge>}
            {user.banned_at && <Badge variant="destructive">Banned</Badge>}
          </SheetTitle>
        </SheetHeader>

        {loading || !detail ? (
          <div className="py-10 text-center text-muted-foreground">
            <Loader2 className="inline animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Conversations" value={detail.conversations_total} />
              <Stat label="Messages" value={detail.messages_total} />
              <Stat label="Voice (mo)" value={detail.voice_usage_this_month} />
            </div>

            {/* Edit profile */}
            <Section title="Profile">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
                <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
                <Field label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
                <Field label="State / Region"><Input value={stateField} onChange={(e) => setStateField(e.target.value)} /></Field>
                <Field label="Language"><Input value={lang} onChange={(e) => setLang(e.target.value)} /></Field>
                <Field label="Gender"><Input value={gender} onChange={(e) => setGender(e.target.value)} /></Field>
              </div>
              <Field label="Admin notes (private)">
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <Button size="sm" onClick={saveProfile} disabled={busy === "save"}>
                {busy === "save" ? <Loader2 className="animate-spin" size={14} /> : "Save profile"}
              </Button>
            </Section>

            {/* Limits */}
            <Section title="Usage limit overrides" description="Leave blank to use the global defaults.">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Daily messages">
                  <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} placeholder="default" />
                </Field>
                <Field label="Monthly voice">
                  <Input type="number" value={voiceLimit} onChange={(e) => setVoiceLimit(e.target.value)} placeholder="default" />
                </Field>
              </div>
              <Button size="sm" variant="outline" onClick={saveLimits} disabled={busy === "limits"}>
                {busy === "limits" ? <Loader2 className="animate-spin" size={14} /> : "Save limits"}
              </Button>
            </Section>

            {/* Account actions */}
            <Section title="Account actions">
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const targetEmail = user.email || detail?.email;
                  return targetEmail ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${targetEmail}`} target="_blank" rel="noopener noreferrer">
                        <Mail size={14} className="mr-1" /> Email user
                      </a>
                    </Button>
                  ) : null;
                })()}
                <Button size="sm" variant="outline" onClick={passwordReset} disabled={busy === "send_password_reset"}>
                  <KeyRound size={14} className="mr-1" /> Password reset link
                </Button>
                <Button size="sm" variant="outline" onClick={magicLink} disabled={busy === "send_magic_link"}>
                  <Mail size={14} className="mr-1" /> Magic link
                </Button>
                <Button size="sm" variant="outline" onClick={impersonate} disabled={busy === "impersonate"}>
                  <Copy size={14} className="mr-1" /> View as user
                </Button>
                <Button size="sm" variant="outline" onClick={forceSignout} disabled={busy === "force_signout"}>
                  <LogOut size={14} className="mr-1" /> Force sign-out
                </Button>
                {isAdmin
                  ? <Button size="sm" variant="outline" onClick={() => roleAct(false)}><ShieldOff size={14} className="mr-1" /> Revoke admin</Button>
                  : <Button size="sm" variant="outline" onClick={() => roleAct(true)}><ShieldCheck size={14} className="mr-1" /> Grant admin</Button>}

                {user.banned_at ? (
                  <Button size="sm" variant="outline" onClick={unbanAct}>Unban</Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Ban size={14} className="mr-1" /> Ban
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ban user?</AlertDialogTitle>
                        <AlertDialogDescription>They won't be able to use Santra until you unban.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input placeholder="Reason (optional)" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={banAct}>Ban</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 size={14} className="mr-1" /> Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Permanently delete this user?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All their conversations, messages, health data, subscriptions and the auth account will be erased. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAccount} className="bg-destructive hover:bg-destructive/90">
                        Delete forever
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Section>

            {/* Subscriptions */}
            <Section title="Subscriptions">
              {(detail.subscriptions || []).length === 0
                ? <p className="text-xs text-muted-foreground">No active subscriptions.</p>
                : (
                  <div className="space-y-1">
                    {detail.subscriptions.map((s: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm border-b border-border pb-1">
                        <span>{s.plan_type} · {s.plan}</span>
                        <Badge variant={s.status === "active" ? "secondary" : "outline"}>{s.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
            </Section>

            {/* Activity timeline */}
            <Section title="Recent activity">
              {(detail.recent_activity || []).length === 0
                ? <p className="text-xs text-muted-foreground">No tracked activity yet.</p>
                : (
                  <ul className="space-y-1.5 text-xs">
                    {detail.recent_activity.map((a: any, i: number) => (
                      <li key={i} className="flex justify-between border-b border-border pb-1">
                        <span>
                          <span className="font-medium">{a.feature}</span>
                          {a.item_key && <span className="text-muted-foreground"> · {a.item_key}</span>}
                        </span>
                        <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </Section>

            <Section title="Recent conversations">
              {(detail.recent_conversations || []).length === 0
                ? <p className="text-xs text-muted-foreground">No conversations.</p>
                : (
                  <ul className="space-y-1.5 text-xs">
                    {detail.recent_conversations.map((c: any) => (
                      <li key={c.id} className="flex justify-between border-b border-border pb-1">
                        <span className="truncate max-w-[60%]">{c.title || "Untitled"}{c.library_id && <span className="text-muted-foreground"> · {c.library_id}</span>}</span>
                        <span className="text-muted-foreground">{c.message_count} msg · {new Date(c.updated_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </Section>

            {detail.health_profile && (
              <Section title="Health profile">
                <div className="text-xs space-y-1">
                  {detail.health_profile.blood_type && <div><span className="text-muted-foreground">Blood type:</span> {detail.health_profile.blood_type}</div>}
                  {detail.health_profile.height_cm && <div><span className="text-muted-foreground">Height:</span> {detail.health_profile.height_cm} cm</div>}
                  {detail.health_profile.weight_kg && <div><span className="text-muted-foreground">Weight:</span> {detail.health_profile.weight_kg} kg</div>}
                  {detail.health_profile.allergies?.length > 0 && <div><span className="text-muted-foreground">Allergies:</span> {detail.health_profile.allergies.join(", ")}</div>}
                  {detail.health_profile.conditions?.length > 0 && <div><span className="text-muted-foreground">Conditions:</span> {detail.health_profile.conditions.join(", ")}</div>}
                  {detail.health_profile.medications?.length > 0 && <div><span className="text-muted-foreground">Medications:</span> {detail.health_profile.medications.join(", ")}</div>}
                </div>
              </Section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-muted/40 rounded-lg py-2">
      <div className="text-lg font-bold">{value ?? 0}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
