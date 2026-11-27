/**
 * Checkout sem cadastro: dados do cliente, endereço (CEP preenche via ViaCEP), escolha de
 * PAC/SEDEX e pagamento pelo Mercado Pago. O preço final é sempre recalculado no servidor.
 */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, type CartLine } from "@/components/cart";
import { Garment } from "@/components/garment";
import { QtyControl } from "@/components/cart-drawer";
import { brl } from "@/lib/price";
import { ConsentCheckbox } from "@/components/consent";
import { cotar, limpaCep, mascaraCep, pesoTotal, FRETE_GRATIS_ACIMA, type Servico } from "@/lib/frete";
import { sizeLabel } from "@/lib/types";

/** Máscara de telefone brasileiro: (11) 90000-0000. */
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const emptyAddr = { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "" };

/** Tela de checkout. Estados: dados do cliente, endereço, serviço de frete escolhido e carregamento. */
export default function Checkout() {
  const { lines, subtotal, setQty, remove } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [addr, setAddr] = useState(emptyAddr);
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "notfound">("idle");
  const [servico, setServico] = useState<Servico>("PAC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const savings = lines.reduce((s, l) => s + (l.originalPrice - l.unitPrice) * l.qty, 0);

  const cotacoes = useMemo(
    () => (limpaCep(addr.cep).length === 8 ? cotar(addr.cep, pesoTotal(lines), subtotal) : null),
    [addr.cep, lines, subtotal],
  );
  const frete = cotacoes?.find((c) => c.servico === servico) ?? null;
  const total = Math.round((subtotal + (frete?.preco ?? 0)) * 100) / 100;

  /** Consulta o ViaCEP (base pública) para preencher rua, bairro, cidade e UF. Só o CEP é enviado. */
  async function buscaCep(v: string) {
    const cep = mascaraCep(v);
    setAddr((a) => ({ ...a, cep }));
    const d = limpaCep(cep);
    if (d.length !== 8) { setCepState("idle"); return; }
    setCepState("loading");
    try {
      // ViaCEP: base pública dos Correios. Só o CEP é enviado.
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) { setCepState("notfound"); return; }
      setAddr((a) => ({ ...a, street: j.logradouro || a.street, district: j.bairro || a.district, city: j.localidade || "", uf: j.uf || "" }));
      setCepState("ok");
    } catch {
      setCepState("notfound");
    }
  }

  /** Envia o pedido para /api/checkout e redireciona para o pagamento. O servidor confere preços e frete. */
  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!frete) { setError("Informe um CEP válido para calcular o frete."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true, customer: form, address: addr, shipping: servico,
          items: lines.map((l: CartLine) => ({ productId: l.productId, size: l.size, qty: l.qty })),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erro ao iniciar pagamento");
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  if (lines.length === 0)
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl">Sua sacola está vazia.</h1>
        <Link href="/colecao" className="btn-primary mt-8">Explorar coleção <span>⟶</span></Link>
      </div>
    );

  const set = (k: keyof typeof emptyAddr) => (e: React.ChangeEvent<HTMLInputElement>) => setAddr({ ...addr, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-10 py-10 md:py-16 grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16">
      <form onSubmit={pay} className="order-2 lg:order-1">
        <h1 className="text-4xl md:text-6xl tracking-tight">Finalizar compra.</h1>
        <p className="mt-3 text-muted">Sem cadastro. Só precisamos do básico para enviar seu pedido.</p>

        <h2 className="text-2xl mt-10 mb-4">1. Seus dados</h2>
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="name">Nome completo</label>
            <input id="name" required className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" required className="field" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="phone">WhatsApp</label>
              <input id="phone" required inputMode="tel" className="field" autoComplete="tel" placeholder="(11) 90000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
            </div>
          </div>
        </div>

        <h2 className="text-2xl mt-10 mb-4">2. Entrega</h2>
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[200px_1fr] gap-4 items-end">
            <div>
              <label className="label" htmlFor="cep">CEP</label>
              <input id="cep" required inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" className="field" value={addr.cep} onChange={(e) => buscaCep(e.target.value)} />
            </div>
            <p className="font-sans text-xs text-muted pb-3">
              {cepState === "loading" ? "Buscando endereço…" : cepState === "notfound" ? <span className="text-wine">CEP não encontrado. Preencha manualmente.</span> : cepState === "ok" ? `${addr.city}/${addr.uf}` : (
                <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="underline">Não sei meu CEP</a>
              )}
            </p>
          </div>
          <div className="grid grid-cols-[1fr_110px] gap-4">
            <div><label className="label" htmlFor="street">Rua</label><input id="street" required className="field" autoComplete="address-line1" value={addr.street} onChange={set("street")} /></div>
            <div><label className="label" htmlFor="number">Número</label><input id="number" required className="field" inputMode="numeric" value={addr.number} onChange={set("number")} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label" htmlFor="complement">Complemento</label><input id="complement" className="field" autoComplete="address-line2" placeholder="Apto, bloco…" value={addr.complement} onChange={set("complement")} /></div>
            <div><label className="label" htmlFor="district">Bairro</label><input id="district" required className="field" value={addr.district} onChange={set("district")} /></div>
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-4">
            <div><label className="label" htmlFor="city">Cidade</label><input id="city" required className="field" autoComplete="address-level2" value={addr.city} onChange={set("city")} /></div>
            <div><label className="label" htmlFor="uf">UF</label><input id="uf" required maxLength={2} className="field uppercase" autoComplete="address-level1" value={addr.uf} onChange={(e) => setAddr({ ...addr, uf: e.target.value.toUpperCase() })} /></div>
          </div>

          {cotacoes && (
            <fieldset className="space-y-2">
              <legend className="label">Frete pelos Correios</legend>
              {cotacoes.map((c) => (
                <label key={c.servico} className={`flex items-center justify-between gap-3 border px-4 py-3 cursor-pointer font-sans text-sm transition ${servico === c.servico ? "border-ink bg-white" : "border-line"}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="servico" checked={servico === c.servico} onChange={() => setServico(c.servico)} className="accent-[#7a1426]" />
                    <span><strong className="font-medium">{c.servico}</strong> <span className="text-muted">· {c.prazo}</span></span>
                  </span>
                  <span className={c.gratis ? "text-wine" : ""}>{c.gratis ? "Grátis" : brl(c.preco)}</span>
                </label>
              ))}
              {subtotal < FRETE_GRATIS_ACIMA && <p className="font-sans text-xs text-muted">Faltam {brl(FRETE_GRATIS_ACIMA - subtotal)} para PAC grátis.</p>}
            </fieldset>
          )}
        </div>

        <div className="mt-8 border border-line bg-white p-4 font-sans text-xs text-muted leading-relaxed">
          <p className="text-ink font-medium mb-1">Resumo das condições</p>
          Total de {brl(total)}{frete ? ` (frete ${frete.servico} ${frete.gratis ? "grátis" : brl(frete.preco)}, ${frete.prazo} após a postagem)` : " + frete"}. Desistência em até 7 dias após o recebimento, com reembolso integral. Primeira troca de tamanho grátis em até 30 dias. Defeitos: até 90 dias.{" "}
          <Link href="/trocas" target="_blank" className="underline">Trocas e devoluções</Link> · <Link href="/termos" target="_blank" className="underline">Termos de Uso</Link>
        </div>
        <div className="mt-6"><ConsentCheckbox purpose="processar e entregar meu pedido" /></div>

        {error && <p className="mt-6 font-sans text-sm text-wine border border-wine/30 bg-wine/5 px-4 py-3">{error}</p>}

        <button disabled={loading} className="btn-primary w-full mt-8 h-14 text-lg">
          {loading ? "Abrindo Mercado Pago…" : <>Pagar {brl(total)} com Mercado Pago <span>⟶</span></>}
        </button>
        <div className="mt-4 flex items-center justify-center gap-2 font-sans text-xs text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="11" rx="1" /><path d="M8 10V7a4 4 0 018 0v3" /></svg>
          Pix, cartão em até 12x ou boleto. Pagamento seguro pelo Mercado Pago.
        </div>
      </form>

      <aside className="order-1 lg:order-2 lg:sticky lg:top-28 self-start bg-white border border-line p-5 md:p-6">
        <h2 className="text-2xl mb-4">Resumo</h2>
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <li key={l.productId + l.size} className="py-4 flex gap-3">
              <div className="w-16 h-20 bg-[#f1efea] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image ? <img src={l.image} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" /> : <Garment category={l.category} fabric={l.fabric} color={l.color} label={l.label} className="w-full h-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="leading-tight">{l.name}</p>
                <p className="font-sans text-xs text-muted">Tam. {sizeLabel(l.size)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <QtyControl qty={l.qty} onChange={(n) => setQty(l.productId, l.size, n)} />
                  <span className="font-sans text-sm">{brl(l.unitPrice * l.qty)}</span>
                </div>
                <button type="button" onClick={() => remove(l.productId, l.size)} className="font-sans text-xs underline text-muted mt-1">Remover</button>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-4 mt-2 space-y-2 font-sans text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{brl(subtotal)}</span></div>
          {savings > 0 && <div className="flex justify-between text-wine"><span>Você economiza</span><span>−{brl(savings)}</span></div>}
          <div className="flex justify-between">
            <span className="text-muted">Frete{frete ? ` (${frete.servico})` : ""}</span>
            <span>{frete ? (frete.gratis ? "Grátis" : brl(frete.preco)) : "Informe o CEP"}</span>
          </div>
          <div className="flex justify-between font-serif text-2xl pt-2"><span>Total</span><span>{brl(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
