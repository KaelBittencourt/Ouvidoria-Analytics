import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Printer, FileDown, Share2, Mail, Phone, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { Manifestation } from "@/lib/sheet";
import { classify, sentiment } from "@/lib/classify";
import jsPDF from "jspdf";

interface Props {
  manifestation: Manifestation | null;
  onClose: () => void;
}

export function ManifestationModal({ manifestation, onClose }: Props) {
  const m = manifestation;
  if (!m) return (
    <Dialog open={false} onOpenChange={onClose}>
      <DialogContent />
    </Dialog>
  );

  const cat = classify(m.text);
  const sen = sentiment(m.text);
  const dateStr = m.timestamp
    ? m.timestamp.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })
    : m.rawTimestamp;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      toast.success("Texto copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const printDoc = () => window.print();

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Manifestação de Ouvidoria", margin, y); y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(dateStr, margin, y); y += 16;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Nome: ${m.name || "—"}`, margin, y); y += 14;
    doc.text(`Telefone: ${m.phone || "—"}`, margin, y); y += 14;
    doc.text(`E-mail: ${m.email || "—"}`, margin, y); y += 14;
    doc.text(`Classificação: ${cat}    Sentimento: ${sen}`, margin, y); y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Manifestação:", margin, y); y += 16;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(m.text || "(vazio)", width);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    }
    const safeName = (m.name || "manifestacao").replace(/[^\w\-]+/g, "_").slice(0, 40);
    doc.save(`ouvidoria_${safeName}.pdf`);
    toast.success("PDF gerado");
  };

  const share = async () => {
    const shareData = {
      title: "Manifestação de Ouvidoria",
      text: `${m.name || "Anônimo"} — ${dateStr}\n\n${m.text}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Conteúdo copiado para compartilhar");
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <Dialog open={!!m} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Manifestação
            <Badge variant="outline">{cat}</Badge>
            <Badge variant="outline">{sen}</Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">Detalhes completos da manifestação</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm sm:grid-cols-2">
          <Field icon={<User className="h-4 w-4" />} label="Nome" value={m.name || "—"} />
          <Field icon={<Calendar className="h-4 w-4" />} label="Data de envio" value={dateStr} />
          <Field icon={<Phone className="h-4 w-4" />} label="Telefone" value={m.phone || "—"} />
          <Field icon={<Mail className="h-4 w-4" />} label="E-mail" value={m.email || "—"} />
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Texto integral</h4>
          <div className="whitespace-pre-wrap rounded-lg border border-border/60 bg-card p-4 text-sm leading-relaxed">
            {m.text || <span className="text-muted-foreground italic">(vazio)</span>}
          </div>
        </div>

        <div className="no-print flex flex-wrap justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={copyText}><Copy className="mr-1.5 h-4 w-4" />Copiar</Button>
          <Button variant="outline" size="sm" onClick={printDoc}><Printer className="mr-1.5 h-4 w-4" />Imprimir</Button>
          <Button variant="outline" size="sm" onClick={exportPdf}><FileDown className="mr-1.5 h-4 w-4" />Exportar PDF</Button>
          <Button size="sm" onClick={share}><Share2 className="mr-1.5 h-4 w-4" />Compartilhar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium" title={value}>{value}</div>
    </div>
  );
}
