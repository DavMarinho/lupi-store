/**
 * Formulário de criar/editar produto: dados, preço, desconto (% ou R$), tamanhos, estoque,
 * cor e foto. Mostra a prévia de como o preço aparece na loja.
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminAction } from "@/components/admin-api";
import { Garment } from "@/components/garment";
import { PriceTag } from "@/components/product-card";
import { CATEGORIES, SIZES, type Product, type University, type Size } from "@/lib/types";

/** Formulário usado para criar e editar. A 'discount' enviada é nula quando o valor é zero. */
export function ProductForm({ product, universities }: { product?: Product; universities: University[] }) {
  const router = useRouter();
  const [p, setP] = useState({
    id: product?.id,
    name: product?.name ?? "",
    description: product?.description ?? "",
    universityId: product?.universityId ?? universities[0]?.id,
    category: product?.category ?? "Moletom",
    price: product?.price ?? 0,
    discountType: product?.discount?.type ?? "percent",
    discountValue: product?.discount?.value ?? 0,
    sizes: product?.sizes ?? (["P", "M", "G", "GG"] as Size[]),
    stock: product?.stock ?? {},
    fabric: product?.fabric ?? "#1c2440",
    image: product?.image ?? "",
    active: product?.active ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const uni = universities.find((u) => u.id === p.universityId);
  const discount = p.discountValue > 0 ? { type: p.discountType as "percent" | "fixed", value: Number(p.discountValue) } : null;

  /** Valida no servidor (saveProduct) e volta para a lista em caso de sucesso. */
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminAction("saveProduct", { product: { ...p, price: Number(p.price), discount } });
      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  /** Exclui o produto depois de uma confirmação. Não dá para desfazer. */
  async function del() {
    if (!p.id || !confirm("Excluir este produto? Essa ação não pode ser desfeita.")) return;
    await adminAction("deleteProduct", { id: p.id });
    router.push("/admin/produtos");
    router.refresh();
  }

  const toggleSize = (s: Size) => setP({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : SIZES.filter((x) => x === s || p.sizes.includes(x)) });

  return (
    <form onSubmit={save} className="grid lg:grid-cols-[1fr_340px] gap-6 max-w-[1200px]">
      <div className="space-y-6">
        <section className="bg-white border border-line p-5 md:p-6 space-y-5">
          <div><label className="label">Nome</label><input required className="field" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Universidade / atlética</label>
              <select className="field" value={p.universityId} onChange={(e) => setP({ ...p, universityId: e.target.value })}>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="field" value={p.category} onChange={(e) => setP({ ...p, category: e.target.value as Product["category"] })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Descrição</label><textarea rows={4} className="field resize-none" value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} /></div>
        </section>

        <section className="bg-white border border-line p-5 md:p-6 space-y-5">
          <h2 className="font-serif text-2xl">Preço e desconto</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div><label className="label">Preço (R$)</label><input required type="number" step="0.01" min="0" className="field" value={p.price || ""} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} /></div>
            <div>
              <label className="label">Tipo de desconto</label>
              <select className="field" value={p.discountType} onChange={(e) => setP({ ...p, discountType: e.target.value as "percent" | "fixed" })}>
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div><label className="label">Desconto</label><input type="number" min="0" step="0.01" className="field" value={p.discountValue || ""} placeholder="0 = sem desconto" onChange={(e) => setP({ ...p, discountValue: Number(e.target.value) })} /></div>
          </div>
          <div className="bg-bg p-4"><p className="label">Como aparece na loja</p><PriceTag product={{ price: Number(p.price) || 0, discount }} large /></div>
        </section>

        <section className="bg-white border border-line p-5 md:p-6 space-y-5">
          <h2 className="font-serif text-2xl">Tamanhos e estoque</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SIZES.map((s) => {
              const on = p.sizes.includes(s);
              return (
                <div key={s} className={`border p-3 ${on ? "border-ink" : "border-line opacity-50"}`}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={on} onChange={() => toggleSize(s)} className="accent-[#7a1426]" /> {s}
                  </label>
                  <input type="number" min="0" disabled={!on} value={p.stock[s] ?? 0} onChange={(e) => setP({ ...p, stock: { ...p.stock, [s]: Number(e.target.value) } })}
                    className="mt-2 w-full border border-line px-2 py-1 text-sm" style={{ fontSize: 14 }} aria-label={`Estoque ${s}`} />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 self-start">
        <section className="bg-white border border-line p-5 space-y-4">
          <div className="aspect-[4/5] bg-[#f1efea]">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <Garment category={p.category} fabric={p.fabric} color={uni?.color ?? "#fff"} label={uni?.name ?? ""} className="w-full h-full p-6" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <input type="color" value={p.fabric} onChange={(e) => setP({ ...p, fabric: e.target.value })} className="w-10 h-10 border border-line" aria-label="Cor do tecido" />
            <span className="text-sm text-muted">Cor do tecido (ilustração)</span>
          </div>
          <div><label className="label">URL da foto (opcional)</label><input className="field" placeholder="https://…" value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} className="accent-[#7a1426]" /> Visível na loja</label>
        </section>
        {error && <p className="text-sm text-wine">{error}</p>}
        <button disabled={saving} className="btn-primary w-full">{saving ? "Salvando…" : "Salvar produto"}</button>
        {p.id && <button type="button" onClick={del} className="w-full text-sm text-wine underline">Excluir produto</button>}
      </aside>
    </form>
  );
}
