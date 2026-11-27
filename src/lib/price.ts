/**
 * Regras de preço: aplica desconto em % ou valor fixo e formata em reais.
 */
import type { Discount, Product } from "./types";

/** Preço depois do desconto. Aceita % (limitada a 100) ou valor fixo e nunca fica negativo. */
export function finalPrice(price: number, discount: Discount): number {
  if (!discount || discount.value <= 0) return price;
  const v =
    discount.type === "percent"
      ? price * (1 - Math.min(discount.value, 100) / 100)
      : price - discount.value;
  return Math.max(0, Math.round(v * 100) / 100);
}

/** Resumo de preço de um produto: original, final, % de desconto e se há desconto. Usado em toda a loja. */
export function productPrice(p: Pick<Product, "price" | "discount">) {
  const final = finalPrice(p.price, p.discount);
  const off = p.price > 0 ? Math.round((1 - final / p.price) * 100) : 0;
  return { original: p.price, final, off, hasDiscount: final < p.price };
}

/** Formata um número como moeda brasileira (R$ 1.234,56). */
export function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
