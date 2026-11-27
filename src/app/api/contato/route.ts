/**
 * Recebe os formulários de Contato e Atléticas. Tem limite de envios por IP, campo isca
 * anti-spam (honeypot), exige consentimento LGPD, salva no banco e encaminha por e-mail.
 */
import { NextResponse } from "next/server";
import { readDB, updateDB, uid } from "@/lib/db";
import { sendMail, esc } from "@/lib/mail";
import type { Contact } from "@/lib/types";

const hits = new Map<string, number[]>();

/** Limite: 5 envios por IP a cada 10 minutos. O campo 'website' preenchido indica robô e é ignorado em silêncio. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot anti-spam
  const s = (k: string, max = 200) => String(b[k] ?? "").trim().slice(0, max);
  const kind: "atletica" | "geral" = b.kind === "geral" ? "geral" : "atletica";
  if (b.consent !== "1" && b.consent !== true) return NextResponse.json({ error: "É preciso aceitar a Política de Privacidade." }, { status: 400 });
  const data = {
    subject: s("subject", 80), order: s("order", 40),
    athletic: s("athletic"), university: s("university"), name: s("name"), role: s("role"),
    email: s("email"), phone: s("phone", 30), instagram: s("instagram", 60), members: s("members", 30), message: s("message", 3000),
  };
  if ((kind === "atletica" && (!data.athletic || !data.university)) || !data.name || !/^\S+@\S+\.\S+$/.test(data.email) || data.message.length < 10)
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });

  const { settings } = await readDB();
  const rows = Object.entries(kind === "geral" ? { Assunto: data.subject || "—", Pedido: data.order || "—", Nome: data.name, "E-mail": data.email, WhatsApp: data.phone || "—" } : {
    Atlética: data.athletic, Universidade: data.university, Responsável: `${data.name} (${data.role || "—"})`,
    "E-mail": data.email, WhatsApp: data.phone || "—", Instagram: data.instagram || "—", Membros: data.members || "—",
  }).map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666">${k}</td><td style="padding:6px 12px">${esc(v)}</td></tr>`).join("");
  const html = `<div style="font-family:Georgia,serif"><h2>${kind === "geral" ? "Nova mensagem pelo site" : "Nova atlética interessada"}</h2><table>${rows}</table><p style="white-space:pre-wrap;border-left:3px solid #7a1426;padding-left:12px">${esc(data.message)}</p></div>`;
  const emailStatus = await sendMail(settings.contactEmail, kind === "geral" ? `Contato: ${data.subject || "mensagem"} — ${data.name}` : `Nova parceria: ${data.athletic} (${data.university})`, html, data.email);

  const stamp = new Date().toISOString();
  const contact: Contact = { id: uid("C"), createdAt: stamp, kind, consentAt: stamp, ...data, emailStatus, read: false };
  await updateDB((db) => { db.contacts.unshift(contact); });
  return NextResponse.json({ ok: true });
}
