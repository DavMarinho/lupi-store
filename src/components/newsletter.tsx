/**
 * Faixa escura de newsletter acima do rodapé, com aceite de consentimento.
 */
"use client";

import Link from "next/link";
import { useState } from "react";

export function Newsletter() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setError(d.error || "Erro ao cadastrar."); setState("idle"); return; }
    setState("done");
  }

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-14 md:py-20 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/50">Newsletter</p>
          <h2 className="mt-3 text-4xl md:text-6xl tracking-tight leading-[1]">Seja o primeiro a vestir.</h2>
          <p className="mt-4 text-white/65 max-w-md">Lançamentos, pré-vendas da sua universidade e acesso antecipado às coleções limitadas. Sem spam.</p>
        </div>
        {state === "done" ? (
          <p className="text-2xl md:text-3xl fade-up">Pronto. Você vai saber primeiro. ✦</p>
        ) : (
          <form onSubmit={submit} className="w-full">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <div className="flex flex-col sm:flex-row border border-white/30 focus-within:border-white transition">
              <label htmlFor="nl-email" className="sr-only">Seu e-mail</label>
              <input id="nl-email" name="email" type="email" required placeholder="seu@email.com" autoComplete="email"
                className="w-full sm:w-0 sm:flex-1 min-w-0 bg-transparent px-5 py-4 font-sans outline-none placeholder:text-white/40" style={{ fontSize: 16 }} />
              <button disabled={state === "sending"} className="bg-white text-ink px-7 py-4 text-lg hover:bg-white/90 transition disabled:opacity-60">
                {state === "sending" ? "Enviando…" : "Quero receber"}
              </button>
            </div>
            <label className="mt-4 flex items-start gap-3 font-sans text-xs text-white/60 leading-relaxed cursor-pointer">
              <input type="checkbox" name="consent" value="1" required className="mt-0.5 accent-white w-4 h-4 shrink-0" />
              <span>Aceito receber e-mails da LUPi. e li a <Link href="/privacidade" className="underline text-white">Política de Privacidade</Link>. Posso cancelar quando quiser.</span>
            </label>
            {error && <p className="mt-3 font-sans text-sm text-[#f0a0ae]">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
