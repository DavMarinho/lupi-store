/**
 * Página de contato geral (dúvidas, trocas, arrependimento, pedidos de privacidade da LGPD).
 * Envia para /api/contato.
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { ConsentCheckbox } from "@/components/consent";
import { EMPRESA } from "@/lib/empresa";

const assuntos = ["Dúvida sobre pedido", "Arrependimento ou cancelamento", "Troca ou devolução", "Parcerias e atléticas", "Privacidade e meus dados (LGPD)", "Outro assunto"];

export default function Contato() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), kind: "geral" };
    const r = await fetch("/api/contato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setError(d.error || "Erro ao enviar."); setState("idle"); return; }
    setState("done");
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 md:px-10 py-14 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20">
      <div>
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">Contato</p>
        <h1 className="mt-4 text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95]">Fale com a LUPi.</h1>
        <p className="mt-6 text-lg md:text-xl text-muted max-w-lg">Pedidos, trocas, parcerias ou só uma pergunta. Respondemos em até 1 dia útil.</p>

        <dl className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-8 font-sans text-sm">
          {EMPRESA.email && <div className="border-t border-ink pt-4">
            <dt className="label">E-mail</dt>
            <dd><a href={`mailto:${EMPRESA.email}`} className="text-lg font-serif hover:underline">{EMPRESA.email}</a></dd>
          </div>}
          {EMPRESA.instagram && <div className="border-t border-ink pt-4">
            <dt className="label">Instagram</dt>
            <dd><a href={`https://instagram.com/${EMPRESA.instagram}`} target="_blank" rel="noreferrer" className="text-lg font-serif hover:underline">@{EMPRESA.instagram}</a></dd>
          </div>}
          {EMPRESA.whatsapp && (
            <div className="border-t border-ink pt-4">
              <dt className="label">WhatsApp</dt>
              <dd><a href={`https://wa.me/${EMPRESA.whatsapp}`} target="_blank" rel="noreferrer" className="text-lg font-serif hover:underline">Chamar no WhatsApp</a></dd>
            </div>
          )}
          <div className="border-t border-ink pt-4">
            <dt className="label">Atendimento</dt>
            <dd className="text-lg font-serif">Seg. a sex., 9h às 18h</dd>
          </div>
          <div className="border-t border-ink pt-4">
            <dt className="label">É de uma atlética?</dt>
            <dd><Link href="/atleticas" className="text-lg font-serif hover:underline">Proponha uma coleção ⟶</Link></dd>
          </div>
        </dl>
        <p className="mt-10 font-sans text-xs text-muted max-w-md">
          Para exercer seus direitos de titular de dados (LGPD), escolha o assunto “Privacidade e meus dados”. Para desistir de uma compra em até 7 dias, escolha “Arrependimento ou cancelamento”.
        </p>
      </div>

      <div className="lg:sticky lg:top-28 self-start bg-white border border-line p-6 md:p-10">
        {state === "done" ? (
          <div className="py-16 text-center fade-up">
            <p className="text-4xl">Mensagem enviada.</p>
            <p className="mt-4 text-muted">Obrigado! Respondemos no e-mail informado.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <h2 className="text-3xl">Envie uma mensagem</h2>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="label" htmlFor="c-name">Nome *</label><input id="c-name" name="name" required className="field" autoComplete="name" /></div>
              <div><label className="label" htmlFor="c-email">E-mail *</label><input id="c-email" name="email" type="email" required className="field" autoComplete="email" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="label" htmlFor="c-phone">WhatsApp</label><input id="c-phone" name="phone" inputMode="tel" className="field" autoComplete="tel" /></div>
              <div>
                <label className="label" htmlFor="c-subject">Assunto</label>
                <select id="c-subject" name="subject" className="field">{assuntos.map((a) => <option key={a}>{a}</option>)}</select>
              </div>
            </div>
            <div><label className="label" htmlFor="c-order">Número do pedido (se tiver)</label><input id="c-order" name="order" className="field" placeholder="LP…" /></div>
            <div><label className="label" htmlFor="c-msg">Mensagem *</label><textarea id="c-msg" name="message" required minLength={10} rows={5} className="field resize-none" /></div>
            <ConsentCheckbox purpose="responder a esta mensagem" />
            {error && <p className="font-sans text-sm text-wine">{error}</p>}
            <button disabled={state === "sending"} className="btn-primary w-full h-14">
              {state === "sending" ? "Enviando…" : <>Enviar <span>⟶</span></>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
