/**
 * Card de produto e etiqueta de preço (preço antigo riscado + porcentagem de desconto + selo
 * de esgotado).
 */
import Link from "next/link";
import type { Product, University } from "@/lib/types";
import { brl, productPrice } from "@/lib/price";
import { Garment } from "./garment";

export function PriceTag({ product, large }: { product: Pick<Product, "price" | "discount">; large?: boolean }) {
  const p = productPrice(product);
  return (
    <div className={`flex items-baseline flex-wrap gap-x-2 font-sans ${large ? "text-2xl" : "text-sm"}`}>
      {p.hasDiscount && <span className="line-through text-muted">{brl(p.original)}</span>}
      <span className={p.hasDiscount ? "text-wine font-medium" : ""}>{brl(p.final)}</span>
      {p.hasDiscount && (
        <span className={`bg-wine text-white px-1.5 py-0.5 ${large ? "text-xs" : "text-[10px]"} tracking-wide`}>−{p.off}%</span>
      )}
    </div>
  );
}

export function ProductCard({ product, uni }: { product: Product; uni: University }) {
  const p = productPrice(product);
  const esgotado = product.sizes.every((s) => (product.stock[s] ?? 0) <= 0);
  return (
    <Link href={`/produto/${product.slug}`} className="group block">
      <div className={`relative aspect-[4/5] bg-[#f1efea] overflow-hidden ${esgotado ? "[&>img]:opacity-60" : ""}`}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <>
            <img src={product.image} alt={product.name} className={`w-full h-full object-contain p-3 mix-blend-multiply transition-all duration-700 group-hover:scale-[1.04] ${product.images?.[1] ? "group-hover:opacity-0" : ""}`} />
            {product.images?.[1] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[1]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-contain p-3 mix-blend-multiply opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            )}
          </>
        ) : (
          <Garment category={product.category} fabric={product.fabric} color={uni.color} label={uni.name}
            className="w-full h-full p-6 transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        {esgotado && <span className="absolute top-3 left-3 bg-ink text-white font-sans text-[11px] tracking-wider px-2 py-1">Esgotado</span>}
        {!esgotado && p.hasDiscount && (
          <span className="absolute top-3 left-3 bg-wine text-white font-sans text-[11px] tracking-wider px-2 py-1">−{p.off}%</span>
        )}
      </div>
      <div className="pt-3 space-y-1">
        <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-muted">{uni.name} · {product.category}</p>
        <p className="text-lg leading-snug group-hover:underline underline-offset-4">{product.name}</p>
        <PriceTag product={product} />
      </div>
    </Link>
  );
}
