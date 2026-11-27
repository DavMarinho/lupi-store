/**
 * Tela que simula o Mercado Pago quando MP_ACCESS_TOKEN não está configurado. O resumo do
 * pedido viaja na própria URL (lib/demo.ts).
 */
import Link from "next/link";
import { brl } from "@/lib/price";
import { parseDemo } from "@/lib/demo";

// Simulação da tela do Mercado Pago — só aparece quando MP_ACCESS_TOKEN não está configurado.
export default async function DemoPay({ searchParams }: PageProps<"/checkout/demo">) {
  const { d } = (await searchParams) as { d?: string };
  const o = parseDemo(d);
  if (!o) return <p className="text-center py-32">Pedido não encontrado.</p>;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="border border-dashed border-wine/40 bg-wine/5 font-sans text-xs text-wine px-4 py-3 mb-6">
        Modo demonstração: o Mercado Pago ainda não foi conectado. Em produção, esta etapa abre o checkout oficial (Pix, cartão, boleto).
      </div>
      <div className="bg-white border border-line p-6">
        <p className="font-sans text-xs uppercase tracking-widest text-muted">Mercado Pago · simulação</p>
        <p className="mt-2 text-3xl">{brl(o.total)}</p>
        <ul className="mt-4 font-sans text-sm text-muted space-y-1">
          {o.items.map((i, k) => <li key={k}>{i.q}× {i.n} ({i.s})</li>)}
        </ul>
        <div className="mt-6 grid gap-3">
          <Link href={`/checkout/sucesso?order=${o.id}&demo=1&d=${d}`} className="btn-primary w-full">Aprovar pagamento (teste)</Link>
          <Link href="/checkout" className="btn-ghost w-full">Cancelar</Link>
        </div>
      </div>
    </div>
  );
}
