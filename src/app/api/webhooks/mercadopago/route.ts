/**
 * Webhook do Mercado Pago. Não confia no corpo recebido: busca o pagamento na API com o
 * token e só então marca o pedido como pago.
 */
import { NextResponse } from "next/server";
import { markPaid } from "@/lib/orders";

// Mercado Pago notifica aqui. Não confiamos no corpo: buscamos o pagamento na API com nosso token.
export async function POST(req: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ ok: true });
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
  if (type !== "payment" || !id || !/^\d+$/.test(String(id))) return NextResponse.json({ ok: true });

  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return NextResponse.json({ ok: false }, { status: 502 });
  const pay = await r.json();
  if (pay.status === "approved" && pay.external_reference) await markPaid(pay.external_reference, String(pay.id));
  return NextResponse.json({ ok: true });
}
