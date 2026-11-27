/**
 * Página de uma coleção. Mostra contagem regressiva e barra de progresso da pré-venda (meta
 * de pedidos para fechar o lote) e os produtos da coleção.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { colecao, COLECOES } from "@/lib/colecoes";
import { ProductCard } from "@/components/product-card";
import { Countdown } from "@/components/countdown";
import { ColecaoCard, isDark } from "@/components/colecao-card";

export const dynamic = "force-dynamic";

export default async function ColecaoPage({ params }: PageProps<"/colecoes/[slug]">) {
  const { slug } = await params;
  const c = colecao(slug);
  if (!c) notFound();
  const db = await readDB();
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));
  const produtos = c.filtro ? db.products.filter((p) => p.active && c.filtro!(p)) : [];
  const outras = COLECOES.filter((x) => x.slug !== c.slug).slice(0, 2);
  const dark = isDark(c);
  const pv = c.preVenda;
  const pct = pv ? Math.min(100, Math.round((pv.confirmados / pv.meta) * 100)) : 0;

  return (
    <>
      <section style={{ background: c.fundo }} className={dark ? "text-white" : "text-ink"}>
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Link href="/colecoes" className={`font-sans text-xs ${dark ? "text-white/60" : "text-ink/60"} hover:underline`}>← Coleções</Link>
            <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.2em]">{c.tag}</p>
            <h1 className="mt-3 text-5xl md:text-8xl tracking-tight leading-[0.95]">{c.titulo}</h1>
            <p className={`mt-6 text-lg max-w-lg ${dark ? "text-white/75" : "text-ink/75"}`}>{c.texto}</p>

            {pv && (
              <div className="mt-10 space-y-6">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] mb-3 opacity-70">A pré-venda termina em</p>
                  <Countdown to={pv.ate} light={dark} />
                </div>
                <div className="max-w-md">
                  <div className="flex justify-between font-sans text-sm mb-2">
                    <span>{pv.confirmados} de {pv.meta} pedidos para fechar o lote</span><span>{pct}%</span>
                  </div>
                  <div className={`h-1.5 ${dark ? "bg-white/20" : "bg-ink/15"}`}><div className="h-full bg-[#e0a526]" style={{ width: `${pct}%` }} /></div>
                  <p className={`mt-3 font-sans text-xs ${dark ? "text-white/60" : "text-ink/60"}`}>
                    Entrega {pv.entrega}. Se o lote mínimo não for atingido, devolvemos 100% do valor.
                  </p>
                </div>
              </div>
            )}

            {c.emBreve && (
              <div className="mt-10">
                <p className="font-sans text-xs uppercase tracking-[0.2em] mb-3 opacity-70">Abre em</p>
                <Countdown to={c.emBreve.em} light={dark} />
                <Link href="/atleticas" className="inline-flex mt-8 bg-white text-ink px-6 py-4 text-lg hover:bg-white/90">
                  Sou de uma atlética e quero o kit da minha turma ⟶
                </Link>
              </div>
            )}
          </div>
          <div className="bg-[#f1efea] aspect-square w-full max-w-[560px] justify-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.capa} alt="" className="w-full h-full object-contain p-8 mix-blend-multiply" />
          </div>
        </div>
      </section>

      {produtos.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-3xl md:text-5xl tracking-tight mb-8">{produtos.length} {produtos.length === 1 ? "peça" : "peças"}.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {produtos.map((p) => <ProductCard key={p.id} product={p} uni={uniById[p.universityId]} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] px-5 md:px-10 pb-16 md:pb-24">
        <h2 className="text-3xl md:text-5xl tracking-tight mb-8">Outras coleções.</h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">{outras.map((o) => <ColecaoCard key={o.slug} c={o} />)}</div>
      </section>
    </>
  );
}
