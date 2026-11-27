/**
 * Único endpoint do painel. O campo 'action' define a operação: login, logout,
 * salvar/excluir produto, desconto rápido, contatos, configurações e restaurar demonstração.
 * Tudo, exceto login, exige sessão de admin.
 */
import { NextResponse } from "next/server";
import { checkCredentials, createSession, destroySession, getAdmin } from "@/lib/auth";
import { updateDB, uid } from "@/lib/db";
import { CATEGORIES, SIZES, type Product, type Size } from "@/lib/types";

const fails = new Map<string, { n: number; until: number }>();

// Ações do painel: um endpoint, campo "action"
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));

  if (b.action === "login") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
    const f = fails.get(ip);
    if (f && f.until > Date.now()) return NextResponse.json({ error: "Muitas tentativas. Aguarde 5 minutos." }, { status: 429 });
    if (!checkCredentials(String(b.email ?? ""), String(b.password ?? ""))) {
      const n = (f?.n ?? 0) + 1;
      fails.set(ip, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    fails.delete(ip);
    await createSession(String(b.email).trim().toLowerCase());
    return NextResponse.json({ ok: true });
  }

  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  switch (b.action) {
    case "logout":
      await destroySession();
      return NextResponse.json({ ok: true });

    case "saveProduct": {
      const p = b.product ?? {};
      const sizes: Size[] = (Array.isArray(p.sizes) ? p.sizes : []).filter((s: Size) => SIZES.includes(s));
      const price = Number(p.price);
      if (!String(p.name ?? "").trim() || !(price > 0) || !CATEGORIES.includes(p.category) || sizes.length === 0)
        return NextResponse.json({ error: "Preencha nome, preço, categoria e ao menos um tamanho." }, { status: 400 });
      let discount: Product["discount"] = null;
      const dv = Number(p.discount?.value);
      if (p.discount && dv > 0) {
        if (p.discount.type === "percent" && dv < 100) discount = { type: "percent", value: dv };
        else if (p.discount.type === "fixed" && dv < price) discount = { type: "fixed", value: dv };
        else return NextResponse.json({ error: "Desconto inválido." }, { status: 400 });
      }
      const stock: Product["stock"] = {};
      sizes.forEach((s) => (stock[s] = Math.max(0, Math.floor(Number(p.stock?.[s] ?? 0)))));
      const image = String(p.image ?? "").trim();
      if (image && !/^(https:\/\/|\/)/.test(image)) return NextResponse.json({ error: "URL da imagem deve começar com https://" }, { status: 400 });

      const saved = await updateDB((db) => {
        if (!db.universities.some((u) => u.id === p.universityId)) return { error: "Universidade inválida." };
        const slugBase = String(p.name).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const existing = db.products.find((x) => x.id === p.id);
        const data = {
          name: String(p.name).trim().slice(0, 120),
          description: String(p.description ?? "").slice(0, 2000),
          universityId: p.universityId, category: p.category, price: Math.round(price * 100) / 100, discount, sizes, stock,
          fabric: /^#[0-9a-f]{6}$/i.test(p.fabric) ? p.fabric : "#cfcfcd",
          image: image || undefined, active: p.active !== false,
        };
        if (existing) { Object.assign(existing, data); return { id: existing.id }; }
        let slug = slugBase || "produto";
        while (db.products.some((x) => x.slug === slug)) slug = `${slugBase}-${Math.random().toString(36).slice(2, 5)}`;
        const np: Product = { id: uid("P"), slug, createdAt: new Date().toISOString(), ...data };
        db.products.unshift(np);
        return { id: np.id };
      });
      if ("error" in saved) return NextResponse.json(saved, { status: 400 });
      return NextResponse.json(saved);
    }

    case "deleteProduct":
      await updateDB((db) => { db.products = db.products.filter((p) => p.id !== b.id); });
      return NextResponse.json({ ok: true });

    case "quickDiscount":
      await updateDB((db) => {
        const p = db.products.find((x) => x.id === b.id);
        const v = Number(b.value);
        if (p) p.discount = v > 0 && v < 100 ? { type: "percent", value: v } : null;
      });
      return NextResponse.json({ ok: true });

    case "markContact":
      await updateDB((db) => { const c = db.contacts.find((x) => x.id === b.id); if (c) c.read = !!b.read; });
      return NextResponse.json({ ok: true });

    case "deleteContact":
      await updateDB((db) => { db.contacts = db.contacts.filter((c) => c.id !== b.id); });
      return NextResponse.json({ ok: true });

    case "saveSettings": {
      const email = String(b.contactEmail ?? "").trim();
      if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
      await updateDB((db) => { db.settings.contactEmail = email; });
      return NextResponse.json({ ok: true });
    }

    case "resetDemo":
      await updateDB(async (db) => {
        const { buildSeed } = await import("@/lib/seed");
        Object.assign(db, buildSeed());
      });
      return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
}
