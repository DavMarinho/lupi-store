/**
 * Área para atléticas: explica o modelo de parceria e traz o formulário de primeiro contato
 * (envia para /api/contato).
 */
"use client";

import { useState } from "react";
import { ConsentCheckbox } from "@/components/consent";

const steps = [
  ["01", "Conversa", "Entendemos a identidade da atlética, o público e o calendário de eventos."],
  ["02", "Coleção", "Desenhamos as peças e enviamos amostras com bordado premium para aprovação."],
  ["03", "Loja", "Publicamos a coleção na LUPi. e cuidamos de pagamento, estoque e entrega."],
  ["04", "Repasse", "A atlética recebe uma porcentagem de cada venda, com relatório mensal."],
];

/** Página de parceria. O formulário usa um campo escondido ('website') como isca contra robôs. */
export default function Atleticas() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/contato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setError(d.error || "Erro ao enviar."); setState("idle"); return; }
    setState("done");
  }

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 md:px-10 py-14 md:py-24 grid lg:grid-cols-2 gap-10 lg:gap-20">
        <div>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">Para atléticas</p>
          <h1 className="mt-4 text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95]">Vamos vestir a sua atlética.</h1>
          <p className="mt-6 text-lg md:text-xl text-muted max-w-lg">
            A LUPi. cria, produz e vende coleções oficiais. Vocês cuidam da torcida, a gente cuida do resto.
          </p>
          <ol className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-8">
            {steps.map(([n, t, d]) => (
              <li key={n} className="border-t border-ink pt-4">
                <span className="font-sans text-xs text-muted">{n}</span>
                <p className="text-2xl mt-1">{t}</p>
                <p className="font-sans text-sm text-muted mt-2 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:sticky lg:top-28 self-start bg-white border border-line p-6 md:p-10">
          {state === "done" ? (
            <div className="py-16 text-center fade-up">
              <p className="text-4xl">Recebemos!</p>
              <p className="mt-4 text-muted">Nosso time entra em contato em até 2 dias úteis.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="text-3xl">Primeiro contato</h2>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">Nome da atlética *</label><input name="athletic" required className="field" /></div>
                <div><label className="label">Universidade / curso *</label><input name="university" required className="field" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">Seu nome *</label><input name="name" required className="field" autoComplete="name" /></div>
                <div><label className="label">Cargo na atlética</label><input name="role" className="field" placeholder="Presidente, diretor(a)…" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">E-mail *</label><input name="email" type="email" required className="field" autoComplete="email" /></div>
                <div><label className="label">WhatsApp</label><input name="phone" inputMode="tel" className="field" autoComplete="tel" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div><label className="label">Instagram</label><input name="instagram" className="field" placeholder="@" /></div>
                <div>
                  <label className="label">Membros / alcance</label>
                  <select name="members" className="field">
                    <option>Até 100</option><option>100 a 300</option><option>300 a 1000</option><option>Mais de 1000</option>
                  </select>
                </div>
              </div>
              <div><label className="label">O que vocês procuram? *</label><textarea name="message" required minLength={10} rows={5} className="field resize-none" placeholder="Peças, quantidade estimada, eventos, prazos…" /></div>
              <ConsentCheckbox purpose="que a LUPI entre em contato sobre esta parceria" />
              {error && <p className="font-sans text-sm text-wine">{error}</p>}
              <button disabled={state === "sending"} className="btn-primary w-full h-14">
                {state === "sending" ? "Enviando…" : <>Enviar <span>⟶</span></>}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
