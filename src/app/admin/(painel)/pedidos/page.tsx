/**
 * Lista dos pedidos mais recentes com cliente, itens, frete e endereço de entrega.
 */
import { readDB } from "@/lib/db";
import { brl } from "@/lib/price";

export const dynamic = "force-dynamic";

const status = { paid: ["Pago", "bg-green-50 text-green-800"], pending: ["Pendente", "bg-amber-50 text-amber-800"], cancelled: ["Cancelado", "bg-gray-100 text-muted"] } as const;

export default async function Pedidos() {
  const db = await readDB();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200);
  return (
    <div className="max-w-[1300px]">
      <h1 className="font-serif text-4xl md:text-5xl mb-6">Pedidos</h1>
      <div className="bg-white border border-line divide-y divide-line">
        {orders.map((o) => (
          <details key={o.id} className="group">
            <summary className="list-none cursor-pointer p-4 grid grid-cols-[1fr_auto] md:grid-cols-[140px_1fr_140px_110px_100px] gap-x-4 gap-y-1 items-center text-sm hover:bg-bg/60">
              <span className="font-medium">{o.id}</span>
              <span className="md:order-none order-3 col-span-2 md:col-span-1 text-muted truncate">{o.customer.name} · {o.items.reduce((a, i) => a + i.qty, 0)} peça(s)</span>
              <span className="hidden md:block text-muted">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
              <span className="tabular-nums md:text-left text-right">{brl(o.total)}</span>
              <span className={`hidden md:inline-block text-xs px-2 py-0.5 rounded-full w-fit ${status[o.status][1]}`}>{status[o.status][0]}</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-muted space-y-1">
              <p>{o.customer.email} · {o.customer.phone} · <span className={status[o.status][1] + " px-2 rounded-full"}>{status[o.status][0]}</span>{o.demo ? " · demonstração" : ""}</p>
              {o.items.map((i) => <p key={i.productId + i.size}>{i.qty}× {i.name} ({i.size}) — {brl(i.unitPrice)}</p>)}
              {o.shipping && <p>Frete {o.shipping.service}: {o.shipping.price ? brl(o.shipping.price) : "grátis"} · {o.shipping.prazo}</p>}
              {o.address && <p>Entrega: {o.address.street}, {o.address.number}{o.address.complement ? ` (${o.address.complement})` : ""} · {o.address.district} · {o.address.city}/{o.address.uf} · CEP {o.address.cep}</p>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
