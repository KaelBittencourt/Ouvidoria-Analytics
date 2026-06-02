import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, X, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export type DatePreset = "all" | "today" | "7d" | "30d" | "month" | "year" | "custom";

export interface FilterState {
  preset: DatePreset;
  from: string; // yyyy-mm-dd
  to: string;
  monthsSelected: number[]; // 1 a 12
  yearsSelected: number[]; // anos
  search: string;
}

interface Props {
  state: FilterState;
  onChange: (s: FilterState) => void;
  years: number[]; // available years
}

const ALL_MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function FiltersBar({ state, onChange, years }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const clear = () =>
    onChange({ preset: "all", from: "", to: "", monthsSelected: [], yearsSelected: [], search: "" });

  const active =
    state.preset !== "all" ||
    state.from ||
    state.to ||
    state.monthsSelected.length > 0 ||
    state.yearsSelected.length > 0 ||
    state.search;

  return (
    <Card className="border-border/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Busca global</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Nome, telefone, e-mail ou conteúdo…"
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Período</label>
          <Select value={state.preset} onValueChange={(v) => set({ preset: v as DatePreset, from: "", to: "", monthsSelected: [], yearsSelected: [] })}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mês</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[140px] justify-between text-left font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <span className="truncate">
                  {state.monthsSelected.length === 0
                    ? "Selecionar"
                    : state.monthsSelected.length === 1
                    ? ALL_MONTHS.find((x) => x.value === state.monthsSelected[0])?.label
                    : `${state.monthsSelected.length} selecionados`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="start">
              <ScrollArea className="h-60 p-2">
                <div className="space-y-1">
                  {ALL_MONTHS.map((mo) => {
                    const checked = state.monthsSelected.includes(mo.value);
                    return (
                      <div
                        key={mo.value}
                        className="flex items-center space-x-2 rounded-md p-1.5 hover:bg-accent cursor-pointer"
                      >
                        <Checkbox
                          id={`month-${mo.value}`}
                          checked={checked}
                          onCheckedChange={(isChecked) => {
                            let next: number[];
                            if (!isChecked) {
                              next = state.monthsSelected.filter((x) => x !== mo.value);
                            } else {
                              next = [...state.monthsSelected, mo.value];
                            }
                            set({
                              monthsSelected: next,
                              preset: (next.length > 0 || state.yearsSelected.length > 0) ? "all" : state.preset,
                              from: "",
                              to: "",
                            });
                          }}
                        />
                        <label
                          htmlFor={`month-${mo.value}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1 capitalize select-none"
                        >
                          {mo.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ano</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[120px] justify-between text-left font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <span className="truncate">
                  {state.yearsSelected.length === 0
                    ? "Selecionar"
                    : state.yearsSelected.length === 1
                    ? state.yearsSelected[0]
                    : `${state.yearsSelected.length} selecionados`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[160px] p-0" align="start">
              <ScrollArea className="h-40 p-2">
                <div className="space-y-1">
                  {years.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground text-center">Nenhum ano disponível</p>
                  ) : (
                    years.map((y) => {
                      const checked = state.yearsSelected.includes(y);
                      return (
                        <div
                          key={y}
                          className="flex items-center space-x-2 rounded-md p-1.5 hover:bg-accent cursor-pointer"
                        >
                          <Checkbox
                            id={`year-${y}`}
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              let next: number[];
                              if (!isChecked) {
                                next = state.yearsSelected.filter((x) => x !== y);
                              } else {
                                next = [...state.yearsSelected, y];
                              }
                              set({
                                yearsSelected: next,
                                preset: (next.length > 0 || state.monthsSelected.length > 0) ? "all" : state.preset,
                                from: "",
                                to: "",
                              });
                            }}
                          />
                          <label
                            htmlFor={`year-${y}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1 select-none"
                          >
                            {y}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {state.preset === "custom" && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">De</label>
              <Input type="date" value={state.from} onChange={(e) => set({ from: e.target.value })} className="w-[160px]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Até</label>
              <Input type="date" value={state.to} onChange={(e) => set({ to: e.target.value })} className="w-[160px]" />
            </div>
          </>
        )}

        {active && (
          <Button variant="ghost" onClick={clear} className="gap-1.5">
            <X className="h-4 w-4" /> Limpar
          </Button>
        )}
      </div>
    </Card>
  );
}
