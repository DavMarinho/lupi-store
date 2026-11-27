/**
 * Cria o pedido. Recalcula preços, estoque e frete no servidor (nunca confia no navegador),
 * grava o pedido e cria a preferência de pagamento no Mercado Pago. Sem token, devolve a
 * tela de demonstração.
 */
import { NextResponse } from "next/server";
import { updateDB, uid } from "@/lib/db";
import { finalPrice } from "@/lib/price";
import type { Address, Order, OrderItem, Size } from "@/lib/types";
import { cotar, limpaCep, pesoTotal, type Servico } from "@/lib/frete";

type Body = {
  customer: { name: string; email: string; phone: string };
  items: { productId: string; size: Size; qty: number }[];
  address?: Partial<Address>;
  shipping?: Servico;
};

/** Fluxo: valida dados e consentimento, recalcula preços/estoque/frete, grava o pedido e cria o pagamento. */
export async function POST(req: Request) {
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  if (!(body as { consent?: boolean }).consent) return NextResponse.json({ error: "É preciso aceitar a Política de Privacidade." }, { status: 400 });
  const c = body.customer ?? ({} as Body["customer"]);
  if (!c.name?.trim() || !/^\S+@\S+\.\S+$/.test(c.email ?? "") || (c.phone ?? "").replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "Preencha nome, e-mail e telefone válidos." }, { status: 400 });
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30)
    return NextResponse.json({ error: "Sacola vazia." }, { status: 400 });
  const a = body.address ?? {};
  const t = (v: unknown, n = 120) => String(v ?? "").trim().slice(0, n);
  const address: Address = {
    cep: limpaCep(t(a.cep, 9)), street: t(a.street), number: t(a.number, 20), complement: t(a.complement, 80),
    district: t(a.district, 80), city: t(a.city, 80), uf: t(a.uf, 2).toUpperCase(),
  };
  if (address.cep.length !== 8 || !address.street || !address.number || !address.district || !address.city || !/^[A-Z]{2}$/.test(address.uf))
    return NextResponse.json({ error: "Preencha o endereço de entrega completo." }, { status: 400 });
  const servico: Servico = body.shipping === "SEDEX" ? "SEDEX" : "PAC";

  // Preço SEMPRE recalculado no servidor (nunca confiar no navegador)
  const result = await updateDB((db) => {
    const items: OrderItem[] = [];
    for (const it of body.items) {
      const p = db.products.find((x) => x.id === it.productId && x.active);
      const qty = Math.floor(Number(it.qty));
      if (!p || !p.sizes.includes(it.size) || !(qty >= 1 && qty <= 10)) return { error: "Produto indisponível na sacola." };
      if ((p.stock[it.size] ?? 0) < qty) return { error: `${p.name} (${it.size}) sem estoque suficiente.` };
      items.push({ productId: p.id, name: p.name, universityId: p.universityId, size: it.size, qty, unitPrice: finalPrice(p.price, p.discount) });
    }
    const subtotal = Math.round(items.reduce((s, i) => s + i.unitPrice * i.qty, 0) * 100) / 100;
    const peso = pesoTotal(items.map((i) => ({ category: db.products.find((x) => x.id === i.productId)?.category ?? "", qty: i.qty })));
    const frete = cotar(address.cep, peso, subtotal)?.find((q) => q.servico === servico);
    if (!frete) return { error: "CEP inválido para entrega." };
    const order: Order = {
      id: uid("LP"),
      createdAt: new Date().toISOString(),
      status: "pending",
      customer: { name: c.name.trim().slice(0, 120), email: c.email.trim().slice(0, 160), phone: c.phone.trim().slice(0, 30) },
      address,
      shipping: { service: frete.servico, price: frete.preco, prazo: frete.prazo },
      items,
      subtotal,
      total: Math.round((subtotal + frete.preco) * 100) / 100,
    };
    db.orders.push(order);
    return { order };
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
  const { order } = result;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const token = process.env.MP_ACCESS_TOKEN;

  // Sem token configurado: modo demonstração (simula a tela do Mercado Pago)
  if (!token) {
    await updateDB((db) => { const o = db.orders.find((x) => x.id === order.id); if (o) o.demo = true; });
    // Resumo vai no link: na Vercel cada função tem seu próprio /tmp
    const d = Buffer.from(JSON.stringify({
      id: order.id, total: order.total, name: order.customer.name.split(" ")[0],
      items: order.items.map((i) => ({ n: i.name, s: i.size, q: i.qty })),
    })).toString("base64url");
    return NextResponse.json({ url: `/checkout/demo?order=${order.id}&d=${d}` });
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(origin);
  const pref = {
    items: order.items.map((i) => ({
      id: i.productId, title: `${i.name} (${i.size})`, quantity: i.qty, unit_price: i.unitPrice, currency_id: "BRL",
    })).concat(order.shipping && order.shipping.price > 0 ? [{ id: "frete", title: `Frete ${order.shipping.service}`, quantity: 1, unit_price: order.shipping.price, currency_id: "BRL" }] : []),
    payer: { name: order.customer.name, email: order.customer.email },
    external_reference: order.id,
    statement_descriptor: "LUPI",
    back_urls: {
      success: `${origin}/checkout/sucesso?order=${order.id}`,
      pending: `${origin}/checkout/sucesso?order=${order.id}`,
      failure: `${origin}/checkout?erro=pagamento`,
    },
    ...(isLocal ? {} : { auto_return: "approved", notification_url: `${origin}/api/webhooks/mercadopago` }),
  };

  const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Idempotency-Key": order.id },
    body: JSON.stringify(pref),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("Mercado Pago erro", r.status, data);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 502 });
  }
  await updateDB((db) => { const o = db.orders.find((x) => x.id === order.id); if (o) o.mpPreferenceId = data.id; });
  const useSandbox = token.startsWith("TEST-");
  return NextResponse.json({ url: useSandbox ? data.sandbox_init_point ?? data.init_point : data.init_point });
}
