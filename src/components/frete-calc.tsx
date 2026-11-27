/**
 * Calculadora de frete por CEP na página do produto (PAC e SEDEX).
 */
"use client";

import { useState } from "react";
import { cotar, mascaraCep, pesoTotal, FRETE_GRATIS_ACIMA, type Cotacao } from "@/lib/frete";
import { brl } from "@/lib/price";

/** Campo de CEP + resultado do frete para uma peça. O cálculo é feito no navegador, sem chamada externa. */
export function FreteCalc({ category, price }: { category: string; price: number }) {
  const [cep, setCep] = useState("");
  const [res, setRes] = useState<Cotacao[] | null>(null);
  const [erro, setErro] = useState(false);

  function calc(e: React.FormEvent) {
    e.preventDefault();
    const r = cotar(cep, pesoTotal([{ category, qty: 1 }]), price);
    setErro(!r);
    setRes(r);
  }

  return (
    <div className="mt-6 border border-line p-4">
      <form onSubmit={calc} className="flex items-center gap-2">
        <label htmlFor="cep-calc" className="font-sans text-sm shrink-0">Calcular frete</label>
        <input id="cep-calc" inputMode="numeric" placeholder="00000-000" value={cep} onChange={(e) => setCep(mascaraCep(e.target.value))}
          className="w-0 flex-1 min-w-0 border border-line px-3 py-2 font-sans outline-none focus:border-ink" style={{ fontSize: 16 }} />
        <button className="btn-ghost py-2 px-4 text-sm">OK</button>
      </form>
      {erro && <p className="mt-2 font-sans text-xs text-wine">CEP inválido.</p>}
      {res && (
        <ul className="mt-3 font-sans text-sm divide-y divide-line">
          {res.map((c) => (
            <li key={c.servico} className="py-2 flex justify-between gap-3">
              <span><strong className="font-medium">{c.servico}</strong> <span className="text-muted">· {c.prazo}</span></span>
              <span className={c.gratis ? "text-wine" : ""}>{c.gratis ? "Grátis" : brl(c.preco)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-sans text-[11px] text-muted">
        Envio pelos Correios a partir de São Paulo. PAC grátis acima de {brl(FRETE_GRATIS_ACIMA)}.{" "}
        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="underline">Não sei meu CEP</a>
      </p>
    </div>
  );
}
