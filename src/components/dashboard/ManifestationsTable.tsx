import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { Manifestation } from "@/lib/sheet";
import { classify, sentiment, summarize, type Category, type Sentiment } from "@/lib/classify";

const CAT_TONE: Record<Category, string> = {
  Reclamação: "bg-destructive/10 text-destructive border-destructive/30",
  Denúncia: "bg-destructive/15 text-destructive border-destructive/40",
  Elogio: "bg-success/10 text-success border-success/30",
  Sugestão: "bg-info/10 text-info border-info/30",
  Solicitação: "bg-accent/15 text-accent border-accent/30",
  Informação: "bg-muted text-muted-foreground border-border",
};

const SENT_TONE: Record<Sentiment, string> = {
  Positivo: "bg-success/10 text-success",
  Neutro: "bg-muted text-muted-foreground",
  Negativo: "bg-destructive/10 text-destructive",
};

const PAGE_SIZE = 25;

export function ManifestationsTable({
  data, onOpen,
}: { data: Manifestation[]; onOpen: (m: Manifestation) => void }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const slice = useMemo(
    () => data.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [data, safePage]
  );

  return (
    <Card className="border-border/60 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Manifestações</h3>
          <p className="text-xs text-muted-foreground">
            {data.length.toLocaleString("pt-BR")} registros
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="tabular-nums">
            {safePage + 1} / {totalPages}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Data</th>
              <th className="px-4 py-2.5 text-left font-medium">Nome</th>
              <th className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">Telefone</th>
              <th className="hidden px-4 py-2.5 text-left font-medium xl:table-cell">E-mail</th>
              <th className="px-4 py-2.5 text-left font-medium">Resumo</th>
              <th className="px-4 py-2.5 text-left font-medium">Classificação</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma manifestação encontrada.
                </td>
              </tr>
            )}
            {slice.map((m) => {
              const cat = classify(m.text);
              const sen = sentiment(m.text);
              return (
                <tr key={m.id} className="border-t border-border/60 transition-colors hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {m.timestamp
                      ? m.timestamp.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : m.rawTimestamp}
                  </td>
                  <td className="px-4 py-2.5 font-medium">{m.name || <span className="text-muted-foreground">—</span>}</td>
                  <td className="hidden whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground lg:table-cell">
                    {m.phone || "—"}
                  </td>
                  <td className="hidden max-w-[200px] truncate px-4 py-2.5 text-xs text-muted-foreground xl:table-cell">
                    {m.email || "—"}
                  </td>
                  <td className="max-w-[420px] px-4 py-2.5 text-xs text-muted-foreground">
                    {summarize(m.text, 120) || <span className="italic">(vazio)</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={`${CAT_TONE[cat]} text-[10px]`}>{cat}</Badge>
                      <Badge variant="outline" className={`${SENT_TONE[sen]} border-transparent text-[10px]`}>{sen}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onOpen(m)}>
                      <Eye className="h-3.5 w-3.5" /> Visualizar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
