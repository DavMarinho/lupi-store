/**
 * Página inicial. A seção principal (hero) reproduz a referência visual do cliente; abaixo
 * vêm: compra por universidade, lançamentos, moletons, ofertas e convite para atléticas.
 */
import Link from "next/link";
import Image from "next/image";
import { readDB } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { COLECOES } from "@/lib/colecoes";
import { ColecaoCard } from "@/components/colecao-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await readDB();
  const unis = db.universities;
  const destaques = db.products.filter((p) => p.active && p.image && p.category === "Moletom").slice(0, 8);
  const promo = db.products.filter((p) => p.active && p.discount).slice(0, 4);
  const uniById = Object.fromEntries(unis.map((u) => [u.id, u]));

  return (
    <>
      {/* HERO — fiel à referência */}
      <section className="mx-auto max-w-[1440px] grid md:grid-cols-[36%_1fr] items-center">
        <div className="relative w-full max-w-[640px] md:max-w-none fade-up">
          {/* Foto da pilha de moletons (recorte da imagem de referência; trocar por foto oficial em alta) */}
          <Image
            src="/img/hero-moletons.webp"
            alt="Pilha de moletons USP, UNICAMP, UNESP, UFRJ, UERJ e PUC-Rio"
            width={548}
            height={722}
            priority
            className="w-full h-[52vh] md:h-auto object-cover object-[0%_40%] md:object-contain"
          />
        </div>
        <div className="px-6 md:pl-[9%] md:pr-10 py-10 md:py-0 fade-up" style={{ animationDelay: ".12s" }}>
          <h1 className="font-serif font-semibold tracking-[-0.035em] leading-[0.92] text-[56px] sm:text-[80px] lg:text-[118px]">
            Vista a sua universidade.
          </h1>
          <Link href="/colecao?cat=Moletom" className="btn-primary mt-8 md:mt-12 text-lg md:text-[26px] md:px-9 md:py-5">
            Explorar moletons <span aria-hidden className="text-2xl md:text-3xl leading-none">⟶</span>
          </Link>
        </div>
      </section>

      {/* COMPRE POR UNIVERSIDADE */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 pt-4 md:pt-8">
        <div className="flex items-center gap-4 md:gap-10">
          <span className="h-px flex-1 bg-line" />
          <h2 className="text-2xl md:text-[34px] whitespace-nowrap">Compre por universidade</h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 md:mt-6 border-b border-line flex md:grid md:grid-cols-6 overflow-x-auto no-scrollbar snap-x">
          {unis.map((u) => (
            <Link key={u.id} href={`/colecao?u=${u.id}`}
              className="snap-start shrink-0 px-5 md:px-0 py-4 md:py-5 text-center text-xl md:text-[30px] tracking-wide hover:text-wine transition-colors">
              {u.name}
            </Link>
          ))}
        </div>
      </section>

      {/* LANÇAMENTOS */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 pt-16 md:pt-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl md:text-5xl tracking-tight">Lançamentos.</h2>
          <Link href="/colecoes" className="font-sans text-sm underline underline-offset-4 py-2">Todas as coleções</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {COLECOES.slice(0, 2).map((c) => <ColecaoCard key={c.slug} c={c} />)}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 py-16 md:py-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl md:text-5xl tracking-tight">Os moletons.</h2>
          <Link href="/colecao" className="font-sans text-sm underline underline-offset-4 py-2">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {destaques.map((p) => <ProductCard key={p.id} product={p} uni={uniById[p.universityId]} />)}
        </div>
      </section>

      {promo.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 md:px-10 pb-16 md:pb-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl md:text-5xl tracking-tight">Com desconto.</h2>
            <Link href="/colecao?promo=1" className="font-sans text-sm underline underline-offset-4 py-2">Ver ofertas</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {promo.map((p) => <ProductCard key={p.id} product={p} uni={uniById[p.universityId]} />)}
          </div>
        </section>
      )}

      {/* CTA ATLÉTICAS */}
      <section className="bg-[#f1efea]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">Para atléticas</p>
            <h2 className="mt-4 text-4xl md:text-6xl tracking-tight leading-[1.02]">Sua atlética merece uma coleção à altura.</h2>
          </div>
          <div className="md:justify-self-end">
            <p className="text-muted max-w-md mb-6">Produzimos linhas exclusivas com bordado premium e cuidamos da venda online. Conte o que vocês precisam.</p>
            <Link href="/atleticas" className="btn-primary text-lg">
              Iniciar uma parceria <span>⟶</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
