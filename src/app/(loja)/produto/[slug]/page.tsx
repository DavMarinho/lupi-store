/**
 * Página de um produto: galeria (frente/costas), preço com desconto, guia de tamanhos,
 * escolha de tamanho, cálculo de frete e informações da peça.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { readDB } from "@/lib/db";
import { Garment } from "@/components/garment";
import { PriceTag, ProductCard } from "@/components/product-card";
import { productPrice } from "@/lib/price";
import { AddToCart } from "./add-to-cart";
import { Gallery } from "@/components/gallery";
import { SizeGuide } from "@/components/size-guide";
import { FreteCalc } from "@/components/frete-calc";

export const dynamic = "force-dynamic";

export default async function Produto({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const db = await readDB();
  const p = db.products.find((x) => x.slug === slug && x.active);
  if (!p) notFound();
  const uni = db.universities.find((u) => u.id === p.universityId)!;
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));
  const related = db.products.filter((x) => x.active && x.id !== p.id && (x.universityId === p.universityId || x.category === p.category)).slice(0, 4);
  const price = productPrice(p);

  return (
    <>
      <div className="mx-auto max-w-[1440px] md:px-10 md:py-10 grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-0 md:gap-14">
        <div className="md:sticky md:top-28 self-start min-w-0">
          {p.image ? (
            <Gallery images={p.images?.length ? p.images : [p.image]} alt={p.name} />
          ) : (
            <div className="bg-[#f1efea] aspect-square md:aspect-[4/5]">
              <Garment category={p.category} fabric={p.fabric} color={uni.color} label={uni.name} className="w-full h-full p-8 md:p-16" />
            </div>
          )}
        </div>

        <div className="px-5 md:px-0 py-8 md:py-6 min-w-0">
          <nav className="font-sans text-xs text-muted">
            <Link href="/colecao" className="hover:underline">Coleção</Link> / <Link href={`/colecao?u=${uni.id}`} className="hover:underline">{uni.name}</Link>
          </nav>
          <h1 className="mt-3 text-4xl md:text-6xl tracking-tight leading-[1.02]">{p.name}</h1>
          <p className="mt-2 text-muted">{uni.fullName}</p>
          <div className="mt-6"><PriceTag product={p} large /></div>
          <p className="font-sans text-sm text-muted mt-1">ou 3x de {(price.final / 3).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} sem juros</p>

          <div className="mt-8 -mb-6 flex justify-end"><SizeGuide category={p.category} /></div>
          <AddToCart
            product={{
              id: p.id, slug: p.slug, name: p.name, universityId: p.universityId, sizes: p.sizes, stock: p.stock,
              unitPrice: price.final, originalPrice: p.price, fabric: p.fabric, color: uni.color, label: uni.name, category: p.category, image: p.image,
            }}
          />
          <FreteCalc category={p.category} price={price.final} />

          <div className="mt-10 border-t border-line divide-y divide-line">
            {[
              ["Descrição", p.description],
              ["Tecido e cuidados", "Lavar do avesso em água fria. Não usar alvejante. Secar à sombra. Bordado resistente a mais de 50 lavagens."],
              ["Entrega e trocas", "Enviamos pelos Correios (PAC ou SEDEX) para todo o Brasil, com postagem em até 2 dias úteis após a confirmação do pagamento. PAC grátis acima de R$ 399. Desistência em até 7 dias e primeira troca de tamanho grátis em até 30 dias."],
            ].map(([t, d], i) => (
              <details key={t} className="group py-5" open={i === 0}>
                <summary className="flex justify-between items-center cursor-pointer list-none text-xl">
                  {t}<span className="font-sans text-muted group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">{d}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 md:px-10 py-16 md:py-24">
          <h2 className="text-3xl md:text-5xl tracking-tight mb-8">Combina com.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {related.map((r) => <ProductCard key={r.id} product={r} uni={uniById[r.universityId]} />)}
          </div>
        </section>
      )}
    </>
  );
}
