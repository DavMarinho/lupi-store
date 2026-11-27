/**
 * Navbar (com busca e ícone da sacola) e rodapé com dados da empresa, políticas e créditos.
 */
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart";
import { EMPRESA, aDefinir } from "@/lib/empresa";

export function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M16 16l5 5" strokeLinecap="round" />
    </svg>
  );
}

export function BagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4.5 8h15l-1 13h-13z" strokeLinejoin="round" />
      <path d="M8.5 8V6.5a3.5 3.5 0 017 0V8" />
    </svg>
  );
}

const links = [
  { href: "/colecao", label: "Coleção" },
  { href: "/universidades", label: "Universidades" },
  { href: "/contato", label: "Contato" },
];

export function Nav() {
  const { count, setOpen } = useCart();
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { if (searching) input.current?.focus(); }, [searching]);
  useEffect(() => { setMenu(false); setSearching(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-[84px] max-w-[1440px] items-center justify-between px-5 md:px-10 border-b border-line">
        <button className="md:hidden -ml-1 p-1" aria-label="Menu" onClick={() => setMenu((v) => !v)}>
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
            {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 8h18M3 16h18" />}
          </svg>
        </button>

        <Link href="/" className="font-serif font-bold tracking-tight text-[30px] md:text-[44px] leading-none md:flex-1">
          LUPi.
        </Link>

        <nav className="hidden md:flex items-center gap-16 text-[21px]">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`relative after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-ink after:transition-all ${pathname.startsWith(l.href) ? "after:w-full" : "after:w-0 hover:after:w-full"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-7 md:flex-1 justify-end">
          <button aria-label="Buscar" onClick={() => setSearching((v) => !v)} className="hover:opacity-60 transition p-2 -m-2"><SearchIcon /></button>
          <button aria-label="Sacola" onClick={() => setOpen(true)} className="relative hover:opacity-60 transition p-2 -m-2">
            <BagIcon />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-wine text-white text-[10px] font-sans flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searching && (
        <form
          className="border-b border-line bg-bg"
          onSubmit={(e) => { e.preventDefault(); router.push(`/colecao?q=${encodeURIComponent(q)}`); }}
        >
          <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-3 flex items-center gap-3">
            <SearchIcon />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar moletom, USP, polo…"
              className="flex-1 bg-transparent outline-none text-lg py-2" style={{ fontSize: 18 }} />
          </div>
        </form>
      )}

      {menu && (
        <div className="md:hidden border-b border-line bg-bg fade-up">
          <nav className="flex flex-col px-5 py-4 text-2xl gap-4">
            {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            <Link href="/atleticas" className="text-muted text-lg">Para atléticas</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-bold text-3xl">LUPi.</p>
          <p className="mt-3 text-muted max-w-sm">Roupas universitárias com acabamento premium. Feitas para durar mais que a graduação.</p>
        </div>
        <div className="font-sans text-sm space-y-2">
          <p className="label">Loja</p>
          <Link href="/colecao" className="block py-1.5 hover:underline">Coleção</Link>
          <Link href="/colecoes" className="block py-1.5 hover:underline">Lançamentos</Link>
          <Link href="/universidades" className="block py-1.5 hover:underline">Universidades</Link>
        </div>
        <div className="font-sans text-sm space-y-2">
          <p className="label">Políticas</p>
          <Link href="/privacidade" className="block py-1.5 hover:underline">Privacidade (LGPD)</Link>
          <Link href="/termos" className="block py-1.5 hover:underline">Termos de Uso</Link>
          <Link href="/trocas" className="block py-1.5 hover:underline">Trocas e Devoluções</Link>
        </div>
        <div className="font-sans text-sm space-y-2">
          <p className="label">Parcerias</p>
          <Link href="/atleticas" className="block py-1.5 hover:underline">Sou de uma atlética</Link>
          <Link href="/contato" className="block py-1.5 hover:underline">Contato</Link>
          <Link href="/admin" className="block py-1.5 hover:underline text-muted">Área do administrador</Link>
        </div>
      </div>
      <p className="text-center font-sans text-[11px] text-muted px-5 pb-2 leading-relaxed">
        Razão social: {aDefinir(EMPRESA.razaoSocial)} · CNPJ: {aDefinir(EMPRESA.cnpj)} · Endereço: {aDefinir(EMPRESA.endereco)} ·{" "}
        Atendimento: {EMPRESA.email ? <a href={`mailto:${EMPRESA.email}`} className="underline">{EMPRESA.email}</a> : <Link href="/contato" className="underline">formulário de Contato</Link>}
      </p>
      <p className="text-center font-sans text-xs text-muted pb-8 px-5">© {new Date().getFullYear()} LUPi. Todos os direitos reservados. · Desenvolvido por Davi Marinho</p>
    </footer>
  );
}
