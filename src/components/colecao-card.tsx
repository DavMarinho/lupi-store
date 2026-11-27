/**
 * Card de coleção/lançamento com selo, chamada e contagem regressiva.
 */
import Link from "next/link";
import type { Colecao } from "@/lib/colecoes";
import { Countdown } from "./countdown";

export const isDark = (c: Colecao) => c.fundo !== "#d9c4a0";

export function ColecaoCard({ c }: { c: Colecao }) {
  const dark = isDark(c);
  return (
    <Link href={`/colecoes/${c.slug}`} className="group block">
      <div className="relative aspect-[16/11] bg-[#f1efea] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.capa} alt="" className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]" />
        <span className="absolute top-4 left-4 font-sans text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-ink text-white">{c.tag}</span>
      </div>
      <div className={`p-5 md:p-6 flex items-end justify-between gap-4 ${dark ? "text-white" : "text-ink"}`} style={{ background: c.fundo }}>
        <div className="min-w-0">
          <h3 className="text-3xl md:text-4xl tracking-tight leading-none">{c.titulo}</h3>
          <p className={`mt-2 ${dark ? "text-white/75" : "text-ink/70"}`}>{c.chamada}</p>
          {(c.preVenda || c.emBreve) && (
            <p className="mt-2 font-sans text-xs">
              {c.preVenda ? "Termina em " : "Abre em "}<Countdown to={c.preVenda?.ate ?? c.emBreve!.em} compact />
            </p>
          )}
        </div>
        <span className="shrink-0 font-sans text-sm underline underline-offset-4">Ver ⟶</span>
      </div>
    </Link>
  );
}
