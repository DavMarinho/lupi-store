/**
 * Página de cadastro de um novo produto.
 */
import Link from "next/link";
import { readDB } from "@/lib/db";
import { ProductForm } from "../form";

export const dynamic = "force-dynamic";

export default async function Novo() {
  const db = await readDB();
  return (
    <div>
      <Link href="/admin/produtos" className="text-sm text-muted hover:text-ink">← Produtos</Link>
      <h1 className="font-serif text-4xl md:text-5xl mt-2 mb-6">Novo produto</h1>
      <ProductForm universities={db.universities} />
    </div>
  );
}
