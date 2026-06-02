export type Category = "Reclamação" | "Elogio" | "Sugestão" | "Solicitação" | "Denúncia" | "Informação";
export type Sentiment = "Positivo" | "Neutro" | "Negativo";

const NEG = [
  "ruim", "péssimo", "pessimo", "horrível", "horrivel", "demora", "demorou", "atraso",
  "descaso", "desrespeito", "grosseiro", "grosseria", "negligência", "negligencia",
  "não foi", "nao foi", "sem atenção", "sem atencao", "reclamar", "reclamação", "reclamacao",
  "lamentável", "lamentavel", "inadmissível", "inadmissivel", "absurdo", "revoltante",
  "indignação", "indignacao", "frio", "sujo", "falta de", "demorado", "errado", "erro",
  "dor", "sofrendo", "abandonado", "desumano", "antiético", "antietico",
];
const POS = [
  "ótimo", "otimo", "excelente", "maravilhoso", "maravilhosa", "obrigado", "obrigada",
  "agradeço", "agradeco", "parabéns", "parabens", "elogiar", "elogio", "carinho",
  "atencioso", "atenciosa", "competente", "dedicado", "dedicada", "gentil", "humano",
  "humana", "profissional", "satisfeito", "satisfeita", "amor", "cuidado",
];

const KW: Record<Category, string[]> = {
  Elogio: ["parabéns", "parabens", "elogio", "elogiar", "agradeço", "agradeco", "obrigad", "excelente", "ótimo", "otimo", "maravilho", "gentil", "carinho", "competente", "dedicad"],
  Denúncia: ["denúncia", "denuncia", "denunciar", "negligência", "negligencia", "abuso", "violência", "violencia", "agressão", "agressao", "ilegal", "antiético", "antietico", "responsabiliz"],
  Sugestão: ["sugestão", "sugestao", "sugiro", "sugerir", "poderia", "poderiam", "deveria", "deveriam", "seria bom", "melhoraria", "proponho", "proposta"],
  Solicitação: ["solicito", "solicitar", "gostaria de", "preciso", "precisamos", "favor", "por favor", "pedido", "requeiro", "necessito"],
  Informação: ["gostaria de saber", "informação", "informacao", "informar", "qual é", "qual e", "como faço", "como faco", "horário", "horario", "dúvida", "duvida", "pergunta"],
  Reclamação: ["reclamação", "reclamacao", "reclamar", "ruim", "péssimo", "pessimo", "demora", "atraso", "descaso", "desrespeito", "grosseiro", "errado", "horríve", "horrive", "absurdo", "lamentáv", "lamentav", "inadmiss"],
};

const CATEGORY_ORDER: Category[] = ["Denúncia", "Elogio", "Sugestão", "Solicitação", "Informação", "Reclamação"];

function countMatches(text: string, words: string[]): number {
  const t = text.toLowerCase();
  let n = 0;
  for (const w of words) if (t.includes(w)) n++;
  return n;
}

export function classify(text: string): Category {
  if (!text) return "Informação";
  const scores: Record<Category, number> = {
    Reclamação: 0, Elogio: 0, Sugestão: 0, Solicitação: 0, Denúncia: 0, Informação: 0,
  };
  for (const c of CATEGORY_ORDER) scores[c] = countMatches(text, KW[c]);
  // Default to Reclamação if heavy negative tone and no other clear category
  let best: Category = "Informação";
  let bestScore = 0;
  for (const c of CATEGORY_ORDER) {
    if (scores[c] > bestScore) {
      bestScore = scores[c];
      best = c;
    }
  }
  if (bestScore === 0) {
    const neg = countMatches(text, NEG);
    const pos = countMatches(text, POS);
    if (neg > pos && neg >= 2) return "Reclamação";
    if (pos > neg && pos >= 2) return "Elogio";
    return "Informação";
  }
  return best;
}

export function sentiment(text: string): Sentiment {
  if (!text) return "Neutro";
  const neg = countMatches(text, NEG);
  const pos = countMatches(text, POS);
  if (pos - neg >= 2) return "Positivo";
  if (neg - pos >= 2) return "Negativo";
  if (neg > pos) return "Negativo";
  if (pos > neg) return "Positivo";
  return "Neutro";
}

export function summarize(text: string, maxChars = 140): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + "…";
}

const STOPWORDS = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
  "no", "na", "nos", "nas", "em", "por", "para", "com", "sem", "sob", "sobre", "até",
  "ate", "que", "se", "é", "e", "ou", "mas", "como", "qual", "quais", "quando", "onde",
  "isso", "isto", "aquilo", "este", "esta", "esse", "essa", "aquele", "aquela", "ele",
  "ela", "eles", "elas", "eu", "tu", "você", "voce", "nós", "nos", "vós", "vos", "lhe",
  "lhes", "me", "te", "se", "nos", "vos", "meu", "minha", "seu", "sua", "nosso", "nossa",
  "foi", "ser", "está", "esta", "estão", "estao", "estava", "estavam", "tem", "têm", "tinha",
  "ter", "haver", "houve", "será", "sera", "serão", "serao", "muito", "muita", "muitos",
  "muitas", "mais", "menos", "também", "tambem", "já", "ja", "ainda", "só", "so", "todo",
  "toda", "todos", "todas", "outro", "outra", "outros", "outras", "qual", "quais", "ao",
  "aos", "à", "às", "pra", "depois", "antes", "agora", "porque", "porquê", "porque",
  "pela", "pelo", "pelas", "pelos", "não", "nao", "sim", "ela", "lá", "la", "aqui",
  "aí", "ai", "https", "http", "www", "br", "com", "fui", "foi", "vou", "ir", "feito",
  "feita", "fazer", "faz", "fazia", "estou", "esteve", "estivemos", "sou", "somos",
]);

export function wordCounts(texts: string[], top = 60): { text: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const t of texts) {
    const words = t
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents for stopword matching
      .replace(/[^a-zçãáàâéêíóôõúü\s]/gi, " ")
      .split(/\s+/);
    const original = t
      .toLowerCase()
      .replace(/[^a-zçãáàâéêíóôõúüA-ZÇÃÁÀÂÉÊÍÓÔÕÚÜ\s]/g, " ")
      .split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w || w.length < 4) continue;
      if (STOPWORDS.has(w)) continue;
      const key = original[i] || w;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}
