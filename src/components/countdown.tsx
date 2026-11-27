/**
 * Contagem regressiva. Começa vazia e só preenche no navegador, para evitar erro de
 * hidratação do React.
 */
"use client";

import { useEffect, useState } from "react";

/** Quebra milissegundos em dias, horas, minutos e segundos. */
function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Contagem regressiva até uma data. 'compact' devolve uma linha pequena, ideal para dentro de parágrafos. */
export function Countdown({ to, light, compact }: { to: string; light?: boolean; compact?: boolean }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(new Date(to).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);

  if (left === null) return compact ? <span className="inline-block h-4 w-36 align-middle" /> : <div className="h-16" />;
  if (left <= 0) return <span className="font-sans text-sm">Encerrado</span>;
  const p = parts(left);
  const items = [["dias", p.d], ["h", p.h], ["min", p.m], ["s", p.s]] as const;
  if (compact)
    return <span className="font-sans text-sm tabular-nums">{p.d}d {String(p.h).padStart(2, "0")}h {String(p.m).padStart(2, "0")}m {String(p.s).padStart(2, "0")}s</span>;
  return (
    <div className="flex gap-3 md:gap-5">
      {items.map(([l, v]) => (
        <div key={l} className="text-center">
          <div className={`font-serif text-4xl md:text-6xl tabular-nums leading-none ${light ? "text-white" : ""}`}>{String(v).padStart(2, "0")}</div>
          <div className={`font-sans text-[10px] uppercase tracking-[0.2em] mt-2 ${light ? "text-white/60" : "text-muted"}`}>{l}</div>
        </div>
      ))}
    </div>
  );
}
