/**
 * Moldura das páginas legais e o componente Canal (mostra o e-mail oficial se existir, senão
 * leva ao formulário de contato).
 */
import Link from "next/link";
import { EMPRESA } from "@/lib/empresa";

const pages = [
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/trocas", label: "Trocas e Devoluções" },
];

export function LegalPage({ title, current, children }: { title: string; current: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1100px] px-5 md:px-10 py-12 md:py-20 grid md:grid-cols-[220px_1fr] gap-10">
      <aside className="md:sticky md:top-28 self-start">
        <p className="label">Documentos</p>
        <nav className="flex md:flex-col gap-x-5 gap-y-2 flex-wrap font-sans text-sm">
          {pages.map((p) => (
            <Link key={p.href} href={p.href} className={p.href === current ? "text-ink underline underline-offset-4" : "text-muted hover:text-ink"}>{p.label}</Link>
          ))}
        </nav>
      </aside>
      <article className="min-w-0">
        <h1 className="text-4xl md:text-6xl tracking-tight">{title}</h1>
        <p className="font-sans text-xs text-muted mt-3">Última atualização: {EMPRESA.atualizado}</p>
        <div className="mt-10 font-sans text-[15px] leading-relaxed text-ink/85 space-y-5 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_strong]:text-ink">
          {children}
        </div>
      </article>
    </div>
  );
}

export function Canal({ email, assunto }: { email?: string; assunto?: string }) {
  if (email) return <a href={`mailto:${email}`}>{email}</a>;
  return <a href="/contato">formulário de Contato{assunto ? ` (assunto “${assunto}”)` : ""}</a>;
}
