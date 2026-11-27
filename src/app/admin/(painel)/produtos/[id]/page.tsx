/**
 * Página de edição de um produto existente.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { ProductForm } from "../form";

export const dynamic = "force-dynamic";

export default async function Editar({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const db = await readDB();
  const product = db.products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <div>
      <Link href="/admin/produtos" className="text-sm text-muted hover:text-ink">← Produtos</Link>
      <h1 className="font-serif text-4xl md:text-5xl mt-2 mb-6">{product.name}</h1>
      <ProductForm product={product} universities={db.universities} />
    </div>
  );
}
