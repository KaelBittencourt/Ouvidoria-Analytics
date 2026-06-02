import { Card } from "@/components/ui/card";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Manifestation } from "@/lib/sheet";
import type { Category, Sentiment } from "@/lib/classify";
import { useMemo } from "react";

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-info)"];

const tooltipStyle = {
  backgroundColor: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`border-border/60 p-4 shadow-sm ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </Card>
  );
}

export function DailyTrend({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of data) {
      if (!m.timestamp) continue;
      const k = m.timestamp.toISOString().slice(0, 10);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    // limit to last 60 days for readability
    return sorted.slice(-60).map(([d, v]) => ({
      d,
      label: new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      v,
    }));
  }, [data]);

  return (
    <ChartCard title="Evolução diária" subtitle="últimos 60 dias com manifestações">
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="v" name="Manifestações" stroke="var(--color-chart-1)" fill="url(#gd)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyTrend({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of data) {
      if (!m.timestamp) continue;
      const k = `${m.timestamp.getFullYear()}-${String(m.timestamp.getMonth() + 1).padStart(2, "0")}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
      const [y, mo] = k.split("-");
      return { label: new Date(+y, +mo - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), v };
    });
  }, [data]);

  return (
    <ChartCard title="Evolução mensal">
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="v" name="Manifestações" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function YearlyTrend({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of data) {
      if (!m.timestamp) continue;
      const y = m.timestamp.getFullYear();
      map.set(y, (map.get(y) ?? 0) + 1);
    }
    return [...map.entries()].sort(([a], [b]) => a - b).map(([y, v]) => ({ label: String(y), v }));
  }, [data]);

  return (
    <ChartCard title="Evolução anual">
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" name="Manifestações" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export function WeekdayDistribution({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const counts = Array(7).fill(0);
    for (const m of data) if (m.timestamp) counts[m.timestamp.getDay()]++;
    return counts.map((v, i) => ({ label: WEEKDAYS[i], v }));
  }, [data]);
  return (
    <ChartCard title="Por dia da semana">
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" name="Manifestações" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function HourDistribution({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const counts = Array(24).fill(0);
    for (const m of data) if (m.timestamp) counts[m.timestamp.getHours()]++;
    return counts.map((v, i) => ({ label: `${String(i).padStart(2, "0")}h`, v }));
  }, [data]);
  return (
    <ChartCard title="Distribuição por horário">
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} interval={1} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" name="Manifestações" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopManifestants({ data }: { data: Manifestation[] }) {
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of data) {
      const name = m.name?.trim() || "(Anônimo)";
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, v]) => ({ name: name.length > 28 ? name.slice(0, 26) + "…" : name, v }));
  }, [data]);
  return (
    <ChartCard title="Ranking de manifestantes" subtitle="top 10 por volume">
      <ResponsiveContainer>
        <BarChart data={series} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="v" name="Manifestações" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryBreakdown({ data }: { data: { category: Category; count: number }[] }) {
  return (
    <ChartCard title="Classificação por categoria" subtitle="análise automática por IA">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function SentimentBreakdown({ data }: { data: { sentiment: Sentiment; count: number }[] }) {
  const colors: Record<Sentiment, string> = {
    Positivo: "var(--color-success)",
    Neutro: "var(--color-muted-foreground)",
    Negativo: "var(--color-destructive)",
  };
  return (
    <ChartCard title="Análise de sentimento">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="sentiment" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" name="Manifestações" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={colors[d.sentiment]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
