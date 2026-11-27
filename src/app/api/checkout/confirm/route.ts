/**
 * Confirma o status do pedido na página de sucesso. Com token do Mercado Pago consulta o
 * pagamento; em modo demonstração aprova o pedido simulado.
 */
import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { markPaid } from "@/lib/orders";
import { parseDemo } from "@/lib/demo";

// Usado na página de sucesso: confirma status do pedido.
// - modo demo: aprova o pedido simulado
// - com token: consulta o pagamento no Mercado Pago (útil em localhost, onde o webhook não chega)
export async function POST(req: Request) {
  const { order: orderId, paymentId, demo, d } = await req.json().catch(() => ({}));
  if (typeof orderId !== "string") return NextResponse.json({ error: "pedido" }, { status: 400 });
  const db = await readDB();
  const order = db.orders.find((o) => o.id === orderId);
  const token = process.env.MP_ACCESS_TOKEN;
  if (!order) {
    // Modo demo na Vercel: o pedido pode estar em outra instância; usa o resumo do link
    const dm = !token && demo ? parseDemo(d) : null;
    if (dm && dm.id === orderId) return NextResponse.json({ id: dm.id, status: "paid", total: dm.total, name: dm.name });
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (!token) {
    if (demo && order.demo) await markPaid(order.id, "DEMO");
  } else if (paymentId && /^\d+$/.test(String(paymentId))) {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const pay = await r.json();
      if (pay.status === "approved" && pay.external_reference === order.id) await markPaid(order.id, String(pay.id));
    }
  }
  const fresh = (await readDB()).orders.find((o) => o.id === orderId)!;
  return NextResponse.json({ id: fresh.id, status: fresh.status, total: fresh.total, name: fresh.customer.name.split(" ")[0] });
}
