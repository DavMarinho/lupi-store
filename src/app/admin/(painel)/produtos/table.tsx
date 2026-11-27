/**
 * Tabela de produtos. O campo de desconto salva ao sair do campo (onBlur) e atualiza o preço
 * final na hora.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { adminAction } from "@/components/admin-api";
import { brl, finalPrice } from "@/lib/price";
import type { Discount } from "@/lib/types";

type Row = { id: string; slug: string; name: string; uni: string; category: string; price: number; discount: Discount; active: boolean; stock: number };

/** Campo de desconto em %. Descontos em valor fixo (R$) são editados na tela do produto. */
function DiscountInput({ row }: { row: Row }) {
  const router = useRouter();
  const initial = row.discount?.type === "percent" ? String(row.discount.value) : "";
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  if (row.discount?.type === "fixed")
    return <Link href={`/admin/produtos/${row.id}`} className="text-wine underline">−{brl(row.discount.value)}</Link>;

  async function save() {
    if (v === initial) return;
    setSaving(true);
    await adminAction("quickDiscount", { id: row.id, value: Number(v) || 0 });
    setSaving(false);
    router.refresh();
  }
  return (
    <div className="inline-flex items-center border border-line bg-white">
      <input value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 2))} onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        inputMode="numeric" placeholder="0" className={`w-10 px-2 py-1 text-right outline-none ${saving ? "opacity-40" : ""}`} style={{ fontSize: 14 }} />
      <span className="pr-2 text-muted">%</span>
    </div>
  );
}

/** Tabela com busca. Mostra preço, desconto, preço final, estoque total e status. */
export function ProductsTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => rows.filter((r) => `${r.name} ${r.uni} ${r.category}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  return (
    <div className="bg-white border border-line">
      <div className="p-4 border-b border-line">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto…" className="field max-w-sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-muted border-b border-line">
              <th className="p-4 font-normal">Produto</th>
              <th className="p-4 font-normal">Preço</th>
              <th className="p-4 font-normal">Desconto</th>
              <th className="p-4 font-normal">Preço final</th>
              <th className="p-4 font-normal">Estoque</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((r) => {
              const f = finalPrice(r.price, r.discount);
              return (
                <tr key={r.id} className="hover:bg-bg/60">
                  <td className="p-4">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.uni} · {r.category}</p>
                  </td>
                  <td className="p-4 tabular-nums">{brl(r.price)}</td>
                  <td className="p-4"><DiscountInput row={r} /></td>
                  <td className={`p-4 tabular-nums ${f < r.price ? "text-wine font-medium" : ""}`}>{brl(f)}</td>
                  <td className={`p-4 tabular-nums ${r.stock <= 5 ? "text-wine" : ""}`}>{r.stock}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.active ? "bg-green-50 text-green-800" : "bg-gray-100 text-muted"}`}>{r.active ? "Ativo" : "Oculto"}</span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <Link href={`/produto/${r.slug}`} target="_blank" className="text-muted hover:text-ink mr-4">Ver</Link>
                    <Link href={`/admin/produtos/${r.id}`} className="underline">Editar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
