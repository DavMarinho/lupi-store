/**
 * Cadastra e-mail na newsletter com consentimento explícito, limite por IP e proteção
 * anti-spam.
 */
import { NextResponse } from "next/server";
import { updateDB } from "@/lib/db";

const hits = new Map<string, number[]>();

/** Cadastra o e-mail (em minúsculas, sem duplicar) junto com a data do consentimento. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  if (b.consent !== "1" && b.consent !== true) return NextResponse.json({ error: "Marque o aceite para receber e-mails." }, { status: 400 });
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 160);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });

  await updateDB((db) => {
    db.newsletter ??= [];
    if (!db.newsletter.some((s) => s.email === email)) {
      const stamp = new Date().toISOString();
      db.newsletter.unshift({ email, createdAt: stamp, consentAt: stamp });
    }
  });
  return NextResponse.json({ ok: true });
}
