/**
 * Seletor de tamanho e botão de adicionar à sacola. Trata peças de tamanho único e peças
 * esgotadas (todos os tamanhos com estoque zero).
 */
"use client";

import { useState } from "react";
import { useCart } from "@/components/cart";
import type { Size } from "@/lib/types";

type P = {
  id: string; slug: string; name: string; universityId: string; sizes: Size[];
  stock: Partial<Record<Size, number>>; unitPrice: number; originalPrice: number;
  fabric: string; color: string; label: string; category: string; image?: string;
};

/** Controla o tamanho escolhido. Se não houver tamanho selecionado, mostra aviso em vez de adicionar. */
export function AddToCart({ product }: { product: P }) {
  const { add, setOpen } = useCart();
  const [size, setSize] = useState<Size | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [err, setErr] = useState(false);
  const esgotado = product.sizes.every((s) => (product.stock[s] ?? 0) <= 0);

  /** Adiciona o item à sacola (com preço já com desconto) e abre a sacola lateral. */
  function onAdd() {
    if (!size) { setErr(true); return; }
    add({
      productId: product.id, slug: product.slug, name: product.name, universityId: product.universityId, size, qty: 1,
      unitPrice: product.unitPrice, originalPrice: product.originalPrice, fabric: product.fabric, color: product.color,
      label: product.label, category: product.category, image: product.image,
    });
    setOpen(true);
  }

  return (
    <div className="mt-8">
      {product.sizes.length === 1 && product.sizes[0] === "U" && <p className="font-sans text-sm text-muted">Tamanho único</p>}
      {product.sizes.length > 1 && (
        <>
          <div className="flex justify-between items-baseline">
            <span className="label">Tamanho</span>
            {err && !size && <span className="font-sans text-xs text-wine">Escolha um tamanho</span>}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {product.sizes.map((s) => {
              const out = (product.stock[s] ?? 0) <= 0;
              return (
                <button key={s} disabled={out} onClick={() => { setSize(s); setErr(false); }}
                  className={`h-12 border font-sans text-sm transition ${size === s ? "bg-ink text-white border-ink" : "border-line hover:border-ink"} ${out ? "opacity-30 line-through cursor-not-allowed" : ""}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </>
      )}
      <button onClick={onAdd} disabled={esgotado} className="btn-primary w-full mt-5 h-14 text-lg">{esgotado ? "Esgotado" : "Adicionar à sacola"}</button>
      {esgotado && <p className="font-sans text-xs text-muted mt-3">Primeira remessa esgotada. Assine a newsletter no rodapé para saber da reposição.</p>}
    </div>
  );
}
