/**
 * Janela com a tabela de medidas por tipo de peça. As medidas são estimativas e devem ser
 * trocadas pelas do fornecedor.
 */
"use client";

import { useEffect, useState } from "react";

// Medidas da peça em cm (peça na horizontal). Ajustar com a modelagem real do fornecedor.
const TABELAS: Record<string, { cols: string[]; rows: (string | number)[][]; nota: string }> = {
  Moletom: {
    cols: ["Tamanho", "Tórax", "Comprimento", "Manga"],
    rows: [["PP", 50, 64, 58], ["P", 53, 67, 60], ["M", 56, 70, 62], ["G", 59, 73, 64], ["GG", 62, 76, 66], ["XG", 66, 79, 67]],
    nota: "Modelagem levemente oversized. Prefere mais justo? Escolha um número abaixo.",
  },
  Camiseta: {
    cols: ["Tamanho", "Tórax", "Comprimento", "Ombro"],
    rows: [["PP", 47, 66, 42], ["P", 50, 69, 44], ["M", 53, 72, 46], ["G", 56, 74, 48], ["GG", 59, 77, 50], ["XG", 62, 79, 52]],
    nota: "Modelagem regular.",
  },
  Regata: {
    cols: ["Tamanho", "Tórax", "Comprimento", "Cava"],
    rows: [["PP", 50, 70, 24], ["P", 53, 73, 25], ["M", 56, 76, 26], ["G", 59, 79, 27], ["GG", 62, 81, 28], ["XG", 65, 83, 29]],
    nota: "Modelagem de basquete, mais solta no corpo.",
  },
  Short: {
    cols: ["Tamanho", "Cintura", "Quadril", "Comprimento"],
    rows: [["PP", 66, 96, 44], ["P", 70, 100, 45], ["M", 74, 104, 46], ["G", 78, 108, 47], ["GG", 82, 112, 48], ["XG", 86, 116, 49]],
    nota: "Cintura em elástico com cordão. Medidas da peça, sem esticar.",
  },
  Cropped: {
    cols: ["Tamanho", "Busto", "Cintura", "Comprimento"],
    rows: [["PP", 74, 62, 33], ["P", 78, 66, 34], ["M", 82, 70, 35], ["G", 86, 74, 36], ["GG", 90, 78, 37]],
    nota: "Malha com elastano, ajuste justo ao corpo. Medidas da peça sem esticar.",
  },
  Polo: {
    cols: ["Tamanho", "Tórax", "Comprimento", "Manga"],
    rows: [["PP", 49, 66, 59], ["P", 52, 69, 61], ["M", 55, 72, 63], ["G", 58, 74, 65], ["GG", 61, 77, 66], ["XG", 64, 79, 67]],
    nota: "Modelagem regular, manga longa.",
  },
  Jaqueta: {
    cols: ["Tamanho", "Tórax", "Comprimento", "Manga"],
    rows: [["PP", 52, 63, 59], ["P", 55, 66, 61], ["M", 58, 69, 63], ["G", 61, 72, 65], ["GG", 64, 74, 66], ["XG", 67, 76, 67]],
    nota: "Pensada para usar sobre camiseta ou moletom fino.",
  },
};

export function SizeGuide({ category }: { category: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const t = TABELAS[category];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="font-sans text-xs underline underline-offset-4 text-muted hover:text-ink py-2">
        Guia de tamanhos
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal aria-label="Guia de tamanhos">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-bg w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 fade-up">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl">Guia de tamanhos</h2>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="p-1">
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {t ? (
              <>
                <p className="font-sans text-sm text-muted mt-2">{category} · medidas da peça em centímetros</p>
                <table className="w-full mt-6 font-sans text-sm text-center">
                  <thead><tr className="border-b border-ink">{t.cols.map((c) => <th key={c} className="py-2 font-medium">{c}</th>)}</tr></thead>
                  <tbody className="divide-y divide-line">
                    {t.rows.map((r) => <tr key={r[0]}>{r.map((v, i) => <td key={i} className={`py-2.5 ${i === 0 ? "font-medium" : "tabular-nums"}`}>{v}</td>)}</tr>)}
                  </tbody>
                </table>
                <p className="font-sans text-xs text-muted mt-4">{t.nota}</p>
                <div className="mt-6 bg-white border border-line p-4 font-sans text-xs text-muted leading-relaxed">
                  <p className="text-ink font-medium mb-1">Como medir</p>
                  <strong className="text-ink">Tórax:</strong> estique uma peça sua que veste bem e meça de uma axila à outra.{" "}
                  <strong className="text-ink">Comprimento:</strong> do ponto mais alto do ombro até a barra.{" "}
                  Compare com a tabela. Na dúvida, a primeira troca de tamanho é grátis.
                </div>
              </>
            ) : (
              <p className="font-sans text-sm text-muted mt-4">
                Tamanho único. {category === "Touca" ? "Malha canelada com elasticidade, veste cabeças de 54 a 62 cm de circunferência." : "Regulagem traseira, de 54 a 61 cm de circunferência."}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
