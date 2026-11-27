/**
 * Checkbox de consentimento da LGPD (usado nos formulários) e o aviso de cookies.
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Checkbox de consentimento (LGPD art. 7º, I e art. 8º)
export function ConsentCheckbox({ name = "consent", purpose }: { name?: string; purpose: string }) {
  return (
    <label className="flex items-start gap-3 font-sans text-xs text-muted leading-relaxed cursor-pointer">
      <input type="checkbox" name={name} value="1" required className="mt-0.5 accent-[#7a1426] w-4 h-4 shrink-0" />
      <span>
        Li e concordo com a <Link href="/privacidade" target="_blank" className="underline text-ink">Política de Privacidade</Link> e os{" "}
        <Link href="/termos" target="_blank" className="underline text-ink">Termos de Uso</Link>, e autorizo o uso dos meus dados para {purpose}.
      </span>
    </label>
  );
}

// Aviso de cookies: o site usa só armazenamento essencial (sacola), sem rastreamento.
export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!localStorage.getItem("lupi_cookies_ok")); }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 md:p-5 pointer-events-none" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="pointer-events-auto mx-auto max-w-3xl bg-ink text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 shadow-2xl">
        <p className="font-sans text-xs leading-relaxed text-white/80 flex-1">
          Usamos apenas armazenamento essencial para manter sua sacola e o funcionamento do site. Não usamos cookies de rastreamento ou publicidade.{" "}
          <Link href="/privacidade#cookies" className="underline text-white">Saiba mais</Link>
        </p>
        <button onClick={() => { localStorage.setItem("lupi_cookies_ok", new Date().toISOString()); setShow(false); }}
          className="shrink-0 bg-white text-ink font-sans text-sm px-5 py-2 hover:bg-white/90">
          Entendi
        </button>
      </div>
    </div>
  );
}
