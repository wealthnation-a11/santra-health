import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, RefreshCw, Power, PowerOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  daily_limit: number;
  total_requests: number;
  last_used_at: string | null;
  created_at: string;
}

interface UsageStat {
  key_prefix: string;
  name: string;
  total_calls: number;
  success_calls: number;
  error_calls: number;
  last_used_at: string | null;
}

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lab-api`;

export function AdminLabApiTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: keyList, error: ke }, { data: statList, error: se }] = await Promise.all([
      supabase.rpc("admin_list_lab_api_keys"),
      supabase.rpc("admin_lab_api_usage_stats", { p_days: days }),
    ]);
    if (ke) toast.error(ke.message);
    if (se) toast.error(se.message);
    setKeys((keyList as ApiKey[]) || []);
    setStats((statList as UsageStat[]) || []);
    setLoading(false);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const createKey = async () => {
    if (!newName.trim()) {
      toast.error("Give the key a name");
      return;
    }
    const { data, error } = await supabase.rpc("admin_create_lab_api_key", {
      p_name: newName.trim(),
      p_daily_limit: newLimit,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setCreatedKey(data as string);
    setNewName("");
    setNewLimit(100);
    toast.success("API key created — copy it now, it won't be shown again.");
    load();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.rpc("admin_revoke_lab_api_key", { p_id: id });
    if (error) return toast.error(error.message);
    toast.success("Key revoked");
    load();
  };

  const restore = async (id: string) => {
    const { error } = await supabase.rpc("admin_restore_lab_api_key", { p_id: id });
    if (error) return toast.error(error.message);
    toast.success("Key restored");
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><KeyRound size={18} /> Public Lab Result API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Third-party apps can send lab result images/PDFs to Santra's Gemini 2.5 Pro interpreter and receive a structured JSON interpretation. Each key has its own daily request limit and usage is logged.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs">Key name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Partner App" />
            </div>
            <div className="w-28">
              <Label className="text-xs">Daily limit</Label>
              <Input type="number" min={1} value={newLimit} onChange={(e) => setNewLimit(Number(e.target.value))} />
            </div>
            <Button onClick={createKey}><Plus size={14} /> Create key</Button>
            <Button variant="outline" onClick={load}><RefreshCw size={14} /> Refresh</Button>
          </div>

          {createdKey && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
              <p className="text-xs font-medium text-primary">New API key — copy now, shown once:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs break-all font-mono">{createdKey}</code>
                <Button size="sm" variant="outline" onClick={() => copy(createdKey)}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} Copy
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Prefix</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Daily limit</TableHead><TableHead className="text-right">Total calls</TableHead>
                <TableHead>Last used</TableHead><TableHead>Created</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-mono text-xs">{k.key_prefix}…</TableCell>
                    <TableCell className="text-sm">{k.name}</TableCell>
                    <TableCell>{k.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Revoked</Badge>}</TableCell>
                    <TableCell className="text-right text-sm">{k.daily_limit}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{k.total_requests}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {k.is_active ? (
                        <Button size="sm" variant="outline" onClick={() => revoke(k.id)}><PowerOff size={14} /> Revoke</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => restore(k.id)}><Power size={14} /> Restore</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage stats */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Usage (last {days} days)</CardTitle>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <Button key={d} size="sm" variant={d === days ? "default" : "outline"} onClick={() => setDays(d)}>{d}d</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No API calls logged yet.</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Key</TableHead><TableHead>Name</TableHead>
                <TableHead className="text-right">Total</TableHead><TableHead className="text-right">Success</TableHead>
                <TableHead className="text-right">Errors</TableHead><TableHead>Last used</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {stats.map((s) => (
                  <TableRow key={s.key_prefix}>
                    <TableCell className="font-mono text-xs">{s.key_prefix}…</TableCell>
                    <TableCell className="text-sm">{s.name}</TableCell>
                    <TableCell className="text-right font-medium">{s.total_calls}</TableCell>
                    <TableCell className="text-right text-sm">{s.success_calls}</TableCell>
                    <TableCell className="text-right text-sm">{s.error_calls}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.last_used_at ? new Date(s.last_used_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Docs */}
      <Card>
        <CardHeader><CardTitle className="text-lg">API documentation</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Endpoint</Label>
            <code className="block mt-1 text-xs font-mono break-all rounded-md border border-border bg-muted/50 p-2">{ENDPOINT}</code>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Example request</Label>
            <pre className="mt-1 text-xs font-mono rounded-md border border-border bg-muted/50 p-2 overflow-x-auto">{`curl -X POST ${ENDPOINT} \\
  -H "x-api-key: lab_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "file": "<base64 string of the lab image/PDF>",
    "mimeType": "image/png",
    "preferredLanguage": "en"
  }'`}</pre>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Response (200)</Label>
            <pre className="mt-1 text-xs font-mono rounded-md border border-border bg-muted/50 p-2 overflow-x-auto">{`{
  "interpretation": "Summary: ... \\n\\nTests:\\n1. Hemoglobin ...",
  "disclaimer": "AI-assisted interpretation — confirm with a healthcare provider.",
  "model": "gemini-2.5-pro"
}`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Pass a base64 <code>file</code> + <code>mimeType</code>, or a public <code>fileUrl</code>. Errors return JSON with an <code>error</code> field and status 400/401/429/500.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
