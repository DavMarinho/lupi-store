/**
 * Página de retorno do pagamento: confirma o pedido com /api/checkout/confirm e esvazia a
 * sacola quando está pago.
 */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/components/cart";
import { brl } from "@/lib/price";

function Inner() {
  const sp = useSearchParams();
  const { clear } = useCart();
  const [info, setInfo] = useState<{ id: string; status: string; total: number; name: string } | null>(null);

  useEffect(() => {
    const order = sp.get("order");
    if (!order) return;
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order, paymentId: sp.get("payment_id") ?? sp.get("collection_id"), demo: sp.get("demo") === "1", d: sp.get("d") }),
    })
      .then((r) => r.json())
      .then((d) => { setInfo(d); if (d.status === "paid") clear(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  if (!info) return <p className="text-center py-32 text-muted">Confirmando pagamento…</p>;
  const paid = info.status === "paid";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 md:py-32 text-center fade-up">
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${paid ? "bg-wine text-white" : "border border-line"}`}>
        {paid ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg> : "…"}
      </div>
      <h1 className="mt-8 text-4xl md:text-6xl tracking-tight">{paid ? `Obrigado, ${info.name}.` : "Pagamento em análise."}</h1>
      <p className="mt-4 text-muted">
        {paid ? "Seu pedido foi confirmado. Você vai receber as atualizações por e-mail e WhatsApp." : "Assim que o Mercado Pago confirmar, avisamos você por e-mail."}
      </p>
      <p className="mt-8 font-sans text-sm">Pedido <strong>{info.id}</strong> · {brl(info.total)}</p>
      <Link href="/colecao" className="btn-ghost mt-10">Continuar comprando</Link>
    </div>
  );
}

export default function Sucesso() {
  return <Suspense><Inner /></Suspense>;
}
