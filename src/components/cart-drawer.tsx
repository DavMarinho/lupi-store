/**
 * Sacola lateral: lista os itens, altera quantidades e leva ao checkout.
 */
"use client";

import Link from "next/link";
import { useCart } from "./cart";
import { Garment } from "./garment";
import { brl } from "@/lib/price";
import { sizeLabel } from "@/lib/types";

export function QtyControl({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center border border-line font-sans text-sm">
      <button className="w-8 h-8 hover:bg-black/5" onClick={() => onChange(qty - 1)} aria-label="Diminuir">−</button>
      <span className="w-8 text-center">{qty}</span>
      <button className="w-8 h-8 hover:bg-black/5" onClick={() => onChange(qty + 1)} aria-label="Aumentar">+</button>
    </div>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, count } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[440px] bg-bg flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 h-16 md:h-[84px] border-b border-line">
          <h2 className="text-2xl">Sacola <span className="text-muted text-base font-sans">({count})</span></h2>
          <button onClick={() => setOpen(false)} aria-label="Fechar" className="p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="text-2xl">Sua sacola está vazia.</p>
            <Link href="/colecao" onClick={() => setOpen(false)} className="btn-primary">Explorar coleção <span>→</span></Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-line px-6">
              {lines.map((l) => (
                <li key={l.productId + l.size} className="py-5 flex gap-4">
                  <Link href={`/produto/${l.slug}`} onClick={() => setOpen(false)} className="w-24 h-28 bg-[#f1efea] shrink-0">
                    {l.image ? <img src={l.image} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" /> : <Garment category={l.category} fabric={l.fabric} color={l.color} label={l.label} className="w-full h-full" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg leading-tight">{l.name}</p>
                    <p className="font-sans text-xs text-muted mt-1">Tamanho {sizeLabel(l.size)}</p>
                    <div className="mt-1 font-sans text-sm">
                      {l.originalPrice > l.unitPrice && <span className="line-through text-muted mr-2">{brl(l.originalPrice)}</span>}
                      <span className={l.originalPrice > l.unitPrice ? "text-wine" : ""}>{brl(l.unitPrice)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <QtyControl qty={l.qty} onChange={(n) => setQty(l.productId, l.size, n)} />
                      <button onClick={() => remove(l.productId, l.size)} className="font-sans text-xs underline text-muted">Remover</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5 space-y-4" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
              <div className="flex justify-between text-xl"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              <p className="font-sans text-xs text-muted">Frete calculado no checkout. Sem necessidade de cadastro.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary w-full">Finalizar compra <span>→</span></Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
