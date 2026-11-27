/**
 * Catálogo completo. Filtros por universidade, tipo de peça e desconto, busca por texto e
 * ordenação por preço, tudo via parâmetros da URL (?u=, ?cat=, ?q=, ?promo=, ?ord=).
 */
import Link from "next/link";
import { readDB } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/types";
import { finalPrice } from "@/lib/price";

export const dynamic = "force-dynamic";

type SP = { u?: string; cat?: string; q?: string; promo?: string; ord?: string };

export default async function Colecao({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const db = await readDB();
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  let list = db.products.filter((p) => p.active);
  if (sp.u) list = list.filter((p) => p.universityId === sp.u);
  if (sp.cat) list = list.filter((p) => p.category === sp.cat);
  if (sp.promo) list = list.filter((p) => p.discount);
  if (sp.q) {
    const terms = norm(sp.q).split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const hay = norm(`${p.name} ${p.category} ${uniById[p.universityId]?.fullName}`);
      return terms.every((t) => hay.includes(t));
    });
  }
  if (sp.ord === "menor") list.sort((a, b) => finalPrice(a.price, a.discount) - finalPrice(b.price, b.discount));
  if (sp.ord === "maior") list.sort((a, b) => finalPrice(b.price, b.discount) - finalPrice(a.price, a.discount));

  const href = (patch: Partial<SP>) => {
    const next = { ...sp, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/colecao${qs ? `?${qs}` : ""}`;
  };
  const uni = sp.u ? uniById[sp.u] : null;

  const chip = (active: boolean) =>
    `shrink-0 px-4 py-2 border font-sans text-sm transition ${active ? "bg-ink text-white border-ink" : "border-line hover:border-ink"}`;

  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-10 md:py-16">
      <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">{uni ? uni.fullName : "Coleção completa"}</p>
      <h1 className="mt-2 text-5xl md:text-7xl tracking-tight">
        {sp.q ? <>“{sp.q}”</> : uni ? uni.name : sp.cat ? `${sp.cat}s` : sp.promo ? "Ofertas" : "Coleção"}
      </h1>

      <div className="mt-8 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          <Link href={href({ u: undefined })} className={chip(!sp.u)}>Todas</Link>
          {db.universities.map((u) => <Link key={u.id} href={href({ u: u.id })} className={chip(sp.u === u.id)}>{u.name}</Link>)}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          <Link href={href({ cat: undefined })} className={chip(!sp.cat)}>Todas as peças</Link>
          {CATEGORIES.filter((c) => db.products.some((p) => p.active && p.category === c)).map((c) => <Link key={c} href={href({ cat: c })} className={chip(sp.cat === c)}>{c}</Link>)}
          <Link href={href({ promo: sp.promo ? undefined : "1" })} className={chip(!!sp.promo)}>Com desconto</Link>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-y border-line py-3 font-sans text-sm">
        <span className="text-muted">{list.length} {list.length === 1 ? "peça" : "peças"}</span>
        <div className="flex gap-4 [&_a]:py-2">
          <Link href={href({ ord: undefined })} className={!sp.ord ? "underline underline-offset-4" : "text-muted"}>Novidades</Link>
          <Link href={href({ ord: "menor" })} className={sp.ord === "menor" ? "underline underline-offset-4" : "text-muted"}>Menor preço</Link>
          <Link href={href({ ord: "maior" })} className={sp.ord === "maior" ? "underline underline-offset-4" : "text-muted"}>Maior preço</Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-2xl">Nada encontrado.</p>
          <Link href="/colecao" className="btn-ghost mt-6">Limpar filtros</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
          {list.map((p) => <ProductCard key={p.id} product={p} uni={uniById[p.universityId]} />)}
        </div>
      )}
    </div>
  );
}
