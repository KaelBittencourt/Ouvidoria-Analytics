import Papa from "papaparse";
import { useEffect, useState } from "react";

const SHEET_ID = "1zzcHvVEh1Tu99_HAfebd3lskts7UNriMlRLsWQsqaRQ";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&t=${Date.now()}`;

export interface Manifestation {
  id: string;
  timestamp: Date | null;
  rawTimestamp: string;
  name: string;
  phone: string;
  email: string;
  text: string;
}

function parseBrDate(s: string): Date | null {
  // "03/05/2024 19:38:48"
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, d, mo, y, h, mi, se] = m;
  return new Date(+y, +mo - 1, +d, +h, +mi, +se);
}

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined" || trimmed.toLowerCase() === "n/a") {
    return "Anônimo";
  }

  // Converter para Title Case tratando preposições comuns em português
  const prepositions = ["de", "di", "do", "da", "dos", "das", "e"];
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, wordsArray) => {
      if (prepositions.includes(word) && index > 0 && index < wordsArray.length - 1) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || trimmed === "-" || trimmed.includes("n/a") || trimmed.includes("ñ") || trimmed === "sem e-mail" || trimmed === "não informado") {
    return "";
  }
  return trimmed;
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed || trimmed === "-" || trimmed.includes("n/a") || trimmed === "sem telefone" || trimmed === "não informado") {
    return "";
  }
  return trimmed;
}

function normalizeText(text: string): string {
  return text.trim().replace(/[ \t]+/g, " ");
}

export async function fetchManifestations(): Promise<Manifestation[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar planilha");
  const text = await res.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const rows = parsed.data as string[][];
  if (rows.length === 0) return [];
  const data: Manifestation[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rawTs = (r[0] ?? "").trim();
    const ts = parseBrDate(rawTs);
    data.push({
      id: `${i}-${rawTs}`,
      timestamp: ts,
      rawTimestamp: rawTs,
      name: normalizeName(r[1] ?? ""),
      phone: normalizePhone(r[2] ?? ""),
      email: normalizeEmail(r[3] ?? ""),
      text: normalizeText(r[4] ?? ""),
    });
  }
  return data.sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0));
}

export function useManifestations(refreshMs = 60_000) {
  const [data, setData] = useState<Manifestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await fetchManifestations();
        if (!alive) return;
        setData(d);
        setLastUpdate(new Date());
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Erro desconhecido");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [refreshMs]);

  const refetch = async () => {
    setLoading(true);
    try {
      const d = await fetchManifestations();
      setData(d);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, lastUpdate, refetch };
}

void CSV_URL;
