import { Users, MessageSquare, CreditCard, Mic, TrendingUp, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, useAdminDailyMessages, useAdminDailySignups, useAdminTopCountries } from "@/hooks/useAdminStats";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const COLORS = ["hsl(170,55%,40%)", "hsl(200,60%,50%)", "hsl(30,80%,55%)", "hsl(280,50%,55%)"];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: dailyMessages } = useAdminDailyMessages();
  const { data: dailySignups } = useAdminDailySignups();
  const { data: topCountries } = useAdminTopCountries();

  const subscriptionPieData = stats
    ? [
        { name: "Free", value: Math.max(0, (stats.total_users as number) - stats.chat_premium - stats.edu_starter - stats.edu_pro) },
        { name: "Chat Premium", value: stats.chat_premium },
        { name: "Edu Starter", value: stats.edu_starter },
        { name: "Edu Pro", value: stats.edu_pro },
      ].filter((d) => d.value > 0)
    : [];

  const statCards = [
    { label: "Total Users", value: stats?.total_users, icon: Users, sub: `+${stats?.new_users_today ?? 0} today` },
    { label: "Messages Today", value: stats?.messages_today, icon: MessageSquare, sub: `${stats?.total_messages ?? 0} total` },
    { label: "Active Subscriptions", value: stats?.total_subscriptions, icon: CreditCard, sub: `${stats?.chat_premium ?? 0} premium` },
    { label: "Conversations", value: stats?.total_conversations, icon: BookOpen, sub: `${stats?.library_conversations ?? 0} library` },
    { label: "Voice This Month", value: stats?.voice_usage_this_month, icon: Mic, sub: "voice prompts" },
    { label: "New This Week", value: stats?.new_users_this_week, icon: TrendingUp, sub: `${stats?.new_users_this_month ?? 0} this month` },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={16} className="text-primary" />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">{card.value ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">User Signups (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySignups ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip labelFormatter={(d) => format(new Date(d as string), "PPP")} />
                  <Line type="monotone" dataKey="count" stroke="hsl(170,55%,40%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Messages per Day (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyMessages ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), "MMM d")} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip labelFormatter={(d) => format(new Date(d as string), "PPP")} />
                  <Bar dataKey="count" fill="hsl(200,60%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {subscriptionPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subscriptionPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {subscriptionPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCountries ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="country" width={100} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(170,55%,40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
