import { Card } from "@/components/ui/card";
import { useMemo } from "react";

export function WordCloud({ words }: { words: { text: string; value: number }[] }) {
  const items = useMemo(() => {
    if (words.length === 0) return [];
    const max = words[0].value;
    const min = words[words.length - 1]?.value ?? 1;
    return words.map((w, i) => {
      const t = (w.value - min) / Math.max(1, max - min);
      const size = 0.8 + t * 1.8; // rem
      const opacity = 0.55 + t * 0.45;
      const palette = ["text-primary", "text-info", "text-accent", "text-success", "text-chart-5"];
      const color = palette[i % palette.length];
      return { ...w, size, opacity, color };
    });
  }, [words]);

  return (
    <Card className="border-border/60 p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Nuvem de palavras</h3>
        <p className="text-xs text-muted-foreground">termos mais frequentes nas manifestações</p>
      </div>
      <div className="flex min-h-[200px] flex-wrap items-center justify-center gap-x-3 gap-y-1 p-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          items.map((w) => (
            <span
              key={w.text}
              className={`${w.color} font-semibold leading-tight transition-transform hover:scale-110`}
              style={{ fontSize: `${w.size}rem`, opacity: w.opacity }}
              title={`${w.text}: ${w.value} ocorrências`}
            >
              {w.text}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}

export function TopThemes({ words }: { words: { text: string; value: number }[] }) {
  const top = words.slice(0, 12);
  const max = top[0]?.value ?? 1;
  return (
    <Card className="border-border/60 p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Principais assuntos</h3>
        <p className="text-xs text-muted-foreground">temas recorrentes</p>
      </div>
      <ul className="space-y-2">
        {top.length === 0 && <li className="text-sm text-muted-foreground">Sem dados.</li>}
        {top.map((w) => (
          <li key={w.text} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{w.text}</span>
              <span className="tabular-nums text-muted-foreground">{w.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(w.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
