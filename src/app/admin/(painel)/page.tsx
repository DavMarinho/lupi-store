/**
 * Dashboard de vendas: faturamento, pedidos, ticket médio, tamanho campeão, mais e menos
 * vendidos, ranking de universidades, categorias e estoque baixo. Filtro de 7, 30 ou 90
 * dias.
 */
import Link from "next/link";
import { readDB } from "@/lib/db";
import { brl } from "@/lib/price";
import { SIZES } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Caixa de conteúdo do dashboard com título pequeno. */
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white border border-line p-5 md:p-6 ${className}`}>
      <h2 className="text-xs uppercase tracking-[0.12em] text-muted mb-4">{title}</h2>
      {children}
    </section>
  );
}

/** Lista com barras horizontais proporcionais ao maior valor (usada nos rankings). */
function Bars({ rows, money }: { rows: { label: string; value: number; sub?: string }[]; money?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.label + i}>
          <div className="flex justify-between text-sm gap-3">
            <span className="truncate">{r.label}</span>
            <span className="tabular-nums shrink-0">{money ? brl(r.value) : r.value}{r.sub ? <span className="text-muted"> · {r.sub}</span> : null}</span>
          </div>
          <div className="h-1.5 bg-bg mt-1.5">
            <div className="h-full bg-wine transition-all" style={{ width: `${(r.value / max) * 100}%`, opacity: 1 - i * 0.08 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Calcula todas as métricas a partir dos pedidos PAGOS do período escolhido (?d=7|30|90). */
export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const sp = (await searchParams) as { d?: string };
  const days = [7, 30, 90].includes(Number(sp.d)) ? Number(sp.d) : 30;
  const db = await readDB();
  const since = Date.now() - days * 86400000;
  const orders = db.orders.filter((o) => o.status === "paid" && new Date(o.createdAt).getTime() >= since);
  const uniName = Object.fromEntries(db.universities.map((u) => [u.id, u.name]));

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const pieces = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  const byProduct = new Map<string, { qty: number; rev: number }>();
  db.products.forEach((p) => byProduct.set(p.id, { qty: 0, rev: 0 }));
  const bySize = new Map<string, number>(SIZES.map((s) => [s, 0]));
  const byUni = new Map<string, { qty: number; rev: number }>(db.universities.map((u) => [u.id, { qty: 0, rev: 0 }]));
  const byCat = new Map<string, number>();
  for (const o of orders)
    for (const i of o.items) {
      const bp = byProduct.get(i.productId) ?? { qty: 0, rev: 0 };
      bp.qty += i.qty; bp.rev += i.qty * i.unitPrice; byProduct.set(i.productId, bp);
      bySize.set(i.size, (bySize.get(i.size) ?? 0) + i.qty);
      const bu = byUni.get(i.universityId) ?? { qty: 0, rev: 0 };
      bu.qty += i.qty; bu.rev += i.qty * i.unitPrice; byUni.set(i.universityId, bu);
      const cat = db.products.find((p) => p.id === i.productId)?.category ?? "Outros";
      byCat.set(cat, (byCat.get(cat) ?? 0) + i.qty);
    }

  const prodName = (id: string) => db.products.find((p) => p.id === id)?.name ?? "Produto removido";
  const ranked = [...byProduct.entries()].filter(([id]) => db.products.some((p) => p.id === id && p.active)).sort((a, b) => b[1].qty - a[1].qty);
  const top = ranked.slice(0, 6);
  const bottom = ranked.slice(-6).reverse();
  const sizes = [...bySize.entries()].filter(([k]) => k !== "U").sort((a, b) => b[1] - a[1]);
  const topSize = sizes[0];
  const unis = [...byUni.entries()].sort((a, b) => b[1].rev - a[1].rev);

  // faturamento por dia
  const daily: number[] = Array(days).fill(0);
  for (const o of orders) {
    const idx = days - 1 - Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 86400000);
    if (idx >= 0 && idx < days) daily[idx] += o.total;
  }
  const maxDay = Math.max(1, ...daily);
  const lowStock = db.products.flatMap((p) => p.active ? Object.entries(p.stock).filter(([, n]) => (n ?? 0) <= 3).map(([s, n]) => ({ p, s, n })) : []).slice(0, 6);
  const isDemo = db.orders.some((o) => o.id.startsWith("DEMO"));

  return (
    <div className="space-y-6 max-w-[1300px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Vendas pagas nos últimos {days} dias{isDemo ? " · inclui dados de demonstração" : ""}</p>
        </div>
        <div className="flex border border-line bg-white text-sm">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin?d=${d}`} className={`px-4 py-2 ${d === days ? "bg-ink text-white" : "hover:bg-bg"}`}>{d} dias</Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          ["Faturamento", brl(revenue)],
          ["Pedidos", String(orders.length)],
          ["Ticket médio", brl(orders.length ? revenue / orders.length : 0)],
          ["Tamanho campeão", topSize && topSize[1] > 0 ? `${topSize[0]} · ${Math.round((topSize[1] / Math.max(1, sizes.reduce((a, [, v]) => a + v, 0))) * 100)}%` : "—"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white border border-line p-4 md:p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{k}</p>
            <p className="font-serif text-2xl md:text-4xl mt-2 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <Card title="Faturamento por dia">
        <div className="flex items-end gap-[2px] h-40">
          {daily.map((v, i) => (
            <div key={i} title={brl(v)} className="flex-1 bg-wine/80 hover:bg-wine min-h-[2px]" style={{ height: `${(v / maxDay) * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-muted mt-2"><span>{days} dias atrás</span><span>hoje</span></div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <Card title="Mais vendidos">
          <Bars rows={top.map(([id, v]) => ({ label: prodName(id), value: v.qty, sub: brl(v.rev) }))} />
        </Card>
        <Card title="Menos vendidos">
          <Bars rows={bottom.map(([id, v]) => ({ label: prodName(id), value: v.qty, sub: v.qty === 0 ? "sem vendas" : brl(v.rev) }))} />
        </Card>
        <Card title="Vendas por tamanho (roupas)">
          <div className="flex items-end gap-3 h-44">
            {SIZES.filter((s) => s !== "U").map((s) => {
              const v = bySize.get(s) ?? 0;
              const max = Math.max(1, ...sizes.map(([, v]) => v));
              return (
                <div key={s} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs tabular-nums">{v}</span>
                  <div className={`w-full ${s === topSize?.[0] ? "bg-wine" : "bg-ink/15"}`} style={{ height: `${(v / max) * 100}%`, minHeight: 2 }} />
                  <span className="text-sm">{s}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Ranking de universidades / atléticas">
          <Bars money rows={unis.map(([id, v]) => ({ label: uniName[id] ?? id, value: Math.round(v.rev) }))} />
          <p className="text-xs text-muted mt-4">Peças: {unis.map(([id, v]) => `${uniName[id]} ${v.qty}`).join(" · ")}</p>
        </Card>
        <Card title="Por categoria (peças)">
          <Bars rows={[...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v }))} />
        </Card>
        <Card title="Estoque baixo">
          {lowStock.length === 0 ? <p className="text-sm text-muted">Tudo certo com o estoque.</p> : (
            <ul className="text-sm divide-y divide-line">
              {lowStock.map(({ p, s, n }) => (
                <li key={p.id + s} className="py-2 flex justify-between gap-3">
                  <Link href={`/admin/produtos/${p.id}`} className="truncate hover:underline">{p.name}</Link>
                  <span className="shrink-0 text-wine">{s}: {n}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
