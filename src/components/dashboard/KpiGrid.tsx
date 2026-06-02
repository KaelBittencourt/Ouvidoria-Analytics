import { Card } from "@/components/ui/card";
import { CalendarDays, CalendarRange, Clock, MessageSquare, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Kpi {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone: "primary" | "info" | "success" | "warning" | "accent";
}

const TONES: Record<Kpi["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  accent: "bg-accent/15 text-accent",
};

export function KpiGrid({
  total, monthCount, last30, dailyAvg, today, uniquePeople,
}: {
  total: number; monthCount: number; last30: number; dailyAvg: number; today: number; uniquePeople: number;
}) {
  const items: Kpi[] = [
    { label: "Total de manifestações", value: total.toLocaleString("pt-BR"), icon: MessageSquare, tone: "primary" },
    { label: "Mês atual", value: monthCount.toLocaleString("pt-BR"), icon: CalendarRange, tone: "info", hint: "manifestações no mês" },
    { label: "Últimos 30 dias", value: last30.toLocaleString("pt-BR"), icon: CalendarDays, tone: "accent" },
    { label: "Média diária", value: dailyAvg.toLocaleString("pt-BR", { maximumFractionDigits: 1 }), icon: TrendingUp, tone: "success", hint: "nos últimos 30 dias" },
    { label: "Hoje", value: today.toLocaleString("pt-BR"), icon: Clock, tone: "warning" },
    { label: "Pessoas únicas", value: uniquePeople.toLocaleString("pt-BR"), icon: Users, tone: "info" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((k) => (
        <Card key={k.label} className="border-border/60 p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
              {k.hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{k.hint}</p>}
            </div>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${TONES[k.tone]}`}>
              <k.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
