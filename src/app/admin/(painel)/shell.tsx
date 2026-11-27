/**
 * Moldura visual do painel: menu lateral no computador e menu de abas no celular.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminAction } from "@/components/admin-api";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/contatos", label: "Contatos" },
  { href: "/admin/config", label: "Configurações" },
];

/** Barra lateral (computador) ou abas rolláveis (celular), com contador de contatos não lidos. */
export function AdminShell({ children, email, unread }: { children: React.ReactNode; email: string; unread: number }) {
  const path = usePathname();
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr] font-sans">
      <aside className="hidden md:flex flex-col border-r border-line bg-white sticky top-0 h-screen">
        <Link href="/admin" className="font-serif font-bold text-3xl px-6 h-20 flex items-center border-b border-line">LUPi.</Link>
        <nav className="flex-1 py-4">
          {items.map((i) => (
            <Link key={i.href} href={i.href}
              className={`flex justify-between items-center px-6 py-2.5 text-sm transition ${active(i.href) ? "text-ink font-medium bg-bg border-r-2 border-wine" : "text-muted hover:text-ink"}`}>
              {i.label}
              {i.href === "/admin/contatos" && unread > 0 && <span className="bg-wine text-white text-[10px] rounded-full px-1.5">{unread}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-line text-xs text-muted space-y-2">
          <p className="truncate">{email}</p>
          <Link href="/" className="block hover:text-ink">Ver loja ↗</Link>
          <button onClick={async () => { await adminAction("logout"); window.location.href = "/admin/login"; }} className="hover:text-ink">Sair</button>
        </div>
      </aside>

      {/* mobile */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-line">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/admin" className="font-serif font-bold text-2xl">LUPi.</Link>
          <button className="text-xs text-muted" onClick={async () => { await adminAction("logout"); window.location.href = "/admin/login"; }}>Sair</button>
        </div>
        <nav className="flex overflow-x-auto no-scrollbar px-3 gap-1 pb-2">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={`shrink-0 px-3 py-1.5 text-sm rounded-full ${active(i.href) ? "bg-ink text-white" : "text-muted"}`}>
              {i.label}{i.href === "/admin/contatos" && unread > 0 ? ` (${unread})` : ""}
            </Link>
          ))}
        </nav>
      </header>

      <main className="p-5 md:p-10 min-w-0">{children}</main>
    </div>
  );
}
