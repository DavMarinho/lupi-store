/**
 * Lista as coleções e lançamentos definidos em lib/colecoes.ts.
 */
import type { Metadata } from "next";
import { COLECOES } from "@/lib/colecoes";
import { ColecaoCard } from "@/components/colecao-card";

export const metadata: Metadata = { title: "Coleções e lançamentos — LUPi." };

export default function Colecoes() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-10 md:py-16">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">Lançamentos</p>
      <h1 className="mt-2 text-5xl md:text-7xl tracking-tight">Coleções.</h1>
      <p className="mt-3 text-muted max-w-xl">Linhas limitadas, pré-vendas por turma e lançamentos de cada estação.</p>
      <div className="mt-10 grid md:grid-cols-2 gap-4 md:gap-6">
        {COLECOES.map((c) => <ColecaoCard key={c.slug} c={c} />)}
      </div>
    </div>
  );
}
