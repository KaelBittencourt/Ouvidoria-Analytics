import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/dashboard/Header";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { FiltersBar, type FilterState } from "@/components/dashboard/FiltersBar";
import {
  CategoryBreakdown, DailyTrend, HourDistribution, MonthlyTrend,
  SentimentBreakdown, TopManifestants, WeekdayDistribution, YearlyTrend,
} from "@/components/dashboard/Charts";

import { ManifestationsTable } from "@/components/dashboard/ManifestationsTable";
import { ManifestationModal } from "@/components/dashboard/ManifestationModal";
import { useManifestations, type Manifestation, fetchManifestations } from "@/lib/sheet";
import { classify, sentiment, type Category, type Sentiment } from "@/lib/classify";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ouvidoria Analytics — Painel Analítico" },
      { name: "description", content: "Painel analítico e operacional das manifestações da ouvidoria, atualizado em tempo real a partir da planilha oficial." },
    ],
  }),
  component: Index,
});

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }

function applyFilters(data: Manifestation[], f: FilterState): Manifestation[] {
  const now = new Date();
  let from: Date | null = null;
  let to: Date | null = null;

  switch (f.preset) {
    case "today": from = startOfDay(now); to = endOfDay(now); break;
    case "7d": from = startOfDay(new Date(now.getTime() - 6 * 86400000)); to = endOfDay(now); break;
    case "30d": from = startOfDay(new Date(now.getTime() - 29 * 86400000)); to = endOfDay(now); break;
    case "month": from = new Date(now.getFullYear(), now.getMonth(), 1); to = endOfDay(now); break;
    case "year": from = new Date(now.getFullYear(), 0, 1); to = endOfDay(now); break;
    case "custom":
      if (f.from) from = startOfDay(new Date(f.from + "T00:00:00"));
      if (f.to) to = endOfDay(new Date(f.to + "T00:00:00"));
      break;
  }

  const q = f.search.trim().toLowerCase();
  return data.filter((m) => {
    if (from && (!m.timestamp || m.timestamp < from)) return false;
    if (to && (!m.timestamp || m.timestamp > to)) return false;

    // Filtragem por múltiplos meses selecionados
    if (f.monthsSelected && f.monthsSelected.length > 0) {
      if (!m.timestamp) return false;
      const mVal = m.timestamp.getMonth() + 1; // 1 a 12
      if (!f.monthsSelected.includes(mVal)) return false;
    }

    // Filtragem por múltiplos anos selecionados
    if (f.yearsSelected && f.yearsSelected.length > 0) {
      if (!m.timestamp) return false;
      const yVal = m.timestamp.getFullYear();
      if (!f.yearsSelected.includes(yVal)) return false;
    }

    if (q) {
      const hay = `${m.name} ${m.phone} ${m.email} ${m.text}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function Index() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, lastUpdate, refetch } = useManifestations(60_000);
  const [filters, setFilters] = useState<FilterState>({ preset: "all", from: "", to: "", monthsSelected: [], yearsSelected: [], search: "" });
  const [selected, setSelected] = useState<Manifestation | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Dados atualizados com sucesso!", {
        description: "O painel foi atualizado com as últimas manifestações.",
      });
    } catch (err) {
      toast.error("Falha na sincronização", {
        description: "Verifique se a planilha está pública e tente novamente.",
      });
    }
  };

  const years = useMemo(() => {
    const s = new Set<number>();
    for (const m of data) if (m.timestamp) s.add(m.timestamp.getFullYear());
    return [...s].sort((a, b) => b - a);
  }, [data]);

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters]);

  const kpis = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(), year = now.getFullYear();
    const today0 = startOfDay(now).getTime();
    const last30 = now.getTime() - 30 * 86400000;
    let monthCount = 0, l30 = 0, todayN = 0;
    const people = new Set<string>();
    for (const m of filtered) {
      const key = (m.email || m.phone || m.name).toLowerCase().trim();
      if (key) people.add(key);
      if (!m.timestamp) continue;
      const t = m.timestamp.getTime();
      if (m.timestamp.getFullYear() === year && m.timestamp.getMonth() === month) monthCount++;
      if (t >= last30) l30++;
      if (t >= today0) todayN++;
    }
    return {
      total: filtered.length,
      monthCount,
      last30: l30,
      dailyAvg: l30 / 30,
      today: todayN,
      uniquePeople: people.size,
    };
  }, [filtered]);

  const categoryData = useMemo(() => {
    const m = new Map<Category, number>();
    for (const x of filtered) {
      const c = classify(x.text);
      m.set(c, (m.get(c) ?? 0) + 1);
    }
    return [...m.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const sentimentData = useMemo(() => {
    const m = new Map<Sentiment, number>([["Positivo", 0], ["Neutro", 0], ["Negativo", 0]]);
    for (const x of filtered) {
      const s = sentiment(x.text);
      m.set(s, (m.get(s) ?? 0) + 1);
    }
    return [...m.entries()].map(([sentiment, count]) => ({ sentiment, count }));
  }, [filtered]);



  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Verificando credenciais de acesso…</p>
        </div>
      </div>
    );
  }

  if (loading && data.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Carregando manifestações…</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <h2 className="mt-3 text-base font-semibold">Erro ao carregar a planilha</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">Verifique se a planilha está pública (qualquer pessoa com o link pode visualizar).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        lastUpdate={lastUpdate}
        loading={loading}
        onRefresh={handleRefresh}
        total={data.length}
        onLogout={logout}
      />
      <main className={`mx-auto max-w-[1600px] space-y-5 px-6 py-6 transition-all duration-500 ${loading ? "opacity-60 blur-[1px] pointer-events-none" : "opacity-100 blur-0"}`}>
        <KpiGrid {...kpis} />
        <FiltersBar state={filters} onChange={setFilters} years={years} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DailyTrend data={filtered} />
          <MonthlyTrend data={filtered} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <YearlyTrend data={filtered} />
          <WeekdayDistribution data={filtered} />
          <HourDistribution data={filtered} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <CategoryBreakdown data={categoryData} />
          <SentimentBreakdown data={sentimentData} />
          <TopManifestants data={filtered} />
        </div>


        <ManifestationsTable data={filtered} onOpen={setSelected} />

        <footer className="no-print pt-2 pb-6 text-center text-xs text-muted-foreground">
          Dados sincronizados automaticamente com a planilha Google Sheets · atualização a cada 60s
        </footer>
      </main>

      <ManifestationModal manifestation={selected} onClose={() => setSelected(null)} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
