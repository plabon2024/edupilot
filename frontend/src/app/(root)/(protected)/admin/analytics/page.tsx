'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/admin.services';
import { RevenueAnalytics, UsageAnalytics, UserGrowthItem } from '@/types/admin.types';
import { Activity, BarChart3, TrendingUp, Users, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  XAxis, PieChart, Pie,
} from 'recharts';
import {
  ChartConfig, ChartContainer, ChartTooltip,
  ChartTooltipContent, ChartLegend, ChartLegendContent,
} from '@/components/ui/chart';

// ── Summary Cards ─────────────────────────────────────────────────────────────
function MetricCard({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; color: string }) {
  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="p-2.5 bg-muted/40 rounded-xl">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chart configs
const chartConfigGrowth: ChartConfig = {
  newUsers: { label: 'New Users', color: 'hsl(var(--chart-1))' },
};
const chartConfigRevenue: ChartConfig = {
  revenue:      { label: 'Revenue ($)',    color: 'hsl(var(--chart-2))' },
  transactions: { label: 'Transactions',  color: 'hsl(var(--chart-3))' },
};
const chartConfigUsage: ChartConfig = {
  documents: { label: 'Documents', color: 'hsl(var(--chart-1))' },
  quizzes:   { label: 'Quizzes',   color: 'hsl(var(--chart-4))' },
  chats:     { label: 'Chats',     color: 'hsl(var(--chart-5))' },
};

export default function AdminAnalyticsPage() {
  const [userGrowth,   setUserGrowth]   = useState<Array<{ date: string; newUsers: number }>>([]);
  const [revenueData,  setRevenueData]  = useState<(RevenueAnalytics & { formatted: any[] }) | null>(null);
  const [usageData,    setUsageData]    = useState<(UsageAnalytics & { formatted: any[] }) | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [growthRes, revenueRes, usageRes] = await Promise.all([
          adminAPI.getUsersGrowth(),
          adminAPI.getRevenueAnalytics(),
          adminAPI.getUsageAnalytics(),
        ]);

        // User growth – format dates
        const formattedGrowth = growthRes.data.data.map((item: UserGrowthItem) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          newUsers: item.newUsers,
        }));
        setUserGrowth(formattedGrowth);

        // Revenue – oldest first for left-to-right chart
        const revData = revenueRes.data.data;
        const formattedRevenue = [...revData.byMonth]
          .reverse()
          .map(item => ({
            month: `${item.year}-${String(item.month).padStart(2, '0')}`,
            revenue: item.revenue,
            transactions: item.transactions,
          }));
        setRevenueData({ ...revData, formatted: formattedRevenue });

        // Usage – pie chart
        const u = usageRes.data.data;
        const formattedUsage = [
          { name: 'Documents', value: u.documents, fill: 'var(--color-documents)' },
          { name: 'Quizzes',   value: u.quizzes,   fill: 'var(--color-quizzes)' },
          { name: 'Chats',     value: u.chats,     fill: 'var(--color-chats)' },
        ];
        setUsageData({ ...u, formatted: formattedUsage });
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !revenueData || !usageData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-56 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[400px] bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  const totalAssets = usageData.documents + usageData.quizzes + usageData.chats;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Analytics Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Detailed insights into user engagement, revenue, and platform usage.
          </p>
        </div>
        <BarChart3 className="w-8 h-8 text-indigo-500 opacity-40" />
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          label="Total Revenue"
          value={`$${revenueData.totalRevenue.toFixed(2)}`}
          color="text-green-600"
        />
        <MetricCard
          icon={<Users className="w-5 h-5 text-violet-500" />}
          label="New Users (30d)"
          value={userGrowth.reduce((s, d) => s + d.newUsers, 0)}
          sub="from growth chart"
          color="text-violet-600"
        />
        <MetricCard
          icon={<FileText className="w-5 h-5 text-indigo-500" />}
          label="Total Documents"
          value={usageData.documents}
          color="text-indigo-600"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5 text-blue-500" />}
          label="Total Assets Created"
          value={totalAssets}
          sub="docs + quizzes + chats"
          color="text-blue-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Growth – spans 2 cols */}
        <Card className="md:col-span-2 shadow-xl border-border/50 bg-background/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-violet-500" /> User Growth (Last 30 Days)
            </CardTitle>
            <CardDescription>Daily new user registrations over time.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ChartContainer config={chartConfigGrowth} className="aspect-auto h-[300px] w-full">
              <AreaChart data={userGrowth} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-newUsers)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-newUsers)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} className="stroke-muted" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 10 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  type="natural"
                  dataKey="newUsers"
                  stroke="var(--color-newUsers)"
                  fill="url(#fillGrowth)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Usage Pie */}
        <Card className="shadow-xl border-border/50 bg-background/50 backdrop-blur-xl">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-indigo-500" /> Platform Usage
            </CardTitle>
            <CardDescription>Overall generated assets.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={chartConfigUsage} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={usageData.formatted}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  strokeWidth={4}
                />
                <ChartLegend
                  content={<ChartLegendContent />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>

            {/* Usage breakdown numbers */}
            <div className="mt-4 space-y-2 pb-4">
              {[
                { label: 'Documents', value: usageData.documents, icon: <FileText className="w-3.5 h-3.5 text-violet-500" /> },
                { label: 'Quizzes',   value: usageData.quizzes,   icon: <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> },
                { label: 'Chats',     value: usageData.chats,     icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/30">
                  <span className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</span>
                  <span className="font-bold">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 – Revenue fullwidth */}
      <Card className="shadow-xl border-border/50 bg-background/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-green-500" /> Monthly Revenue Breakdown
          </CardTitle>
          <CardDescription>
            Total Revenue: <span className="font-bold text-foreground">${revenueData.totalRevenue.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfigRevenue} className="aspect-auto h-[320px] w-full">
            <BarChart accessibilityLayer data={revenueData.formatted} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue"      fill="var(--color-revenue)"      radius={[4, 4, 0, 0]} />
              <Bar dataKey="transactions" fill="var(--color-transactions)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
