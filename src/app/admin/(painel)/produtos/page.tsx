/**
 * Lista de produtos com busca e desconto editável direto na tabela.
 */
import Link from "next/link";
import { readDB } from "@/lib/db";
import { ProductsTable } from "./table";

export const dynamic = "force-dynamic";

export default async function Produtos() {
  const db = await readDB();
  const uniName = Object.fromEntries(db.universities.map((u) => [u.id, u.name]));
  const rows = db.products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, uni: uniName[p.universityId], category: p.category, price: p.price,
    discount: p.discount, active: p.active, stock: Object.values(p.stock).reduce((a: number, b) => a + (b ?? 0), 0),
  }));
  return (
    <div className="max-w-[1300px]">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl">Produtos</h1>
          <p className="text-sm text-muted mt-1">{rows.length} cadastrados. Defina descontos direto na lista.</p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primary text-sm py-3">+ Novo produto</Link>
      </div>
      <ProductsTable rows={rows} />
    </div>
  );
}
