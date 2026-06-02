import { Activity, Moon, RefreshCw, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
  total: number;
  onLogout?: () => void;
}

export function Header({ lastUpdate, loading, onRefresh, total, onLogout }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Activity className="h-6 w-6" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight tracking-tight">Ouvidoria Hospitalar</h1>
            <p className="text-xs text-muted-foreground">
              Painel analítico · {total.toLocaleString("pt-BR")} manifestações
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            {lastUpdate ? (
              <>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  <span className="font-medium text-foreground">Sincronizado</span>
                </div>
                <div>
                  atualizado {formatDistanceToNow(lastUpdate, { locale: ptBR, addSuffix: true })}
                </div>
              </>
            ) : (
              <span>Carregando…</span>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} aria-label="Atualizar">
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </Button>
          <Button variant="outline" size="icon" onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {onLogout && (
            <Button
              variant="outline"
              size="icon"
              onClick={onLogout}
              aria-label="Sair"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
