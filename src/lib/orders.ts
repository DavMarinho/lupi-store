/**
 * Marca um pedido como pago e baixa o estoque. É idempotente: chamar duas vezes não baixa
 * estoque em dobro.
 */
import "server-only";
import { updateDB } from "./db";
import type { Order } from "./types";

// Marca pedido como pago e baixa estoque (idempotente)
export async function markPaid(orderId: string, paymentId?: string): Promise<Order | null> {
  return updateDB((db) => {
    const o = db.orders.find((x) => x.id === orderId);
    if (!o) return null;
    if (o.status !== "paid") {
      o.status = "paid";
      if (paymentId) o.mpPaymentId = paymentId;
      for (const it of o.items) {
        const p = db.products.find((x) => x.id === it.productId);
        if (p && p.stock[it.size] !== undefined) p.stock[it.size] = Math.max(0, (p.stock[it.size] ?? 0) - it.qty);
      }
    }
    return o;
  });
}
