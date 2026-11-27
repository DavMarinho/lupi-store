/**
 * Formulário do e-mail de destino dos contatos e botão para restaurar os dados de
 * demonstração.
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminAction } from "@/components/admin-api";

export function SettingsForm({ contactEmail }: { contactEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(contactEmail);
  const [msg, setMsg] = useState("");

  return (
    <>
      <form
        className="bg-white border border-line p-5 md:p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try { await adminAction("saveSettings", { contactEmail: email }); setMsg("Salvo."); router.refresh(); }
          catch (err) { setMsg((err as Error).message); }
        }}
      >
        <h2 className="font-serif text-2xl">E-mail das parcerias</h2>
        <p className="text-sm text-muted">Todo formulário enviado na página “Para atléticas” é encaminhado para este endereço.</p>
        <input type="email" className="field" placeholder="parcerias@lupi.com.br" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex items-center gap-4">
          <button className="btn-primary text-sm py-3">Salvar</button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </form>
      <section className="bg-white border border-line p-5 md:p-6 space-y-3">
        <h2 className="font-serif text-2xl">Dados de demonstração</h2>
        <p className="text-sm text-muted">Restaura produtos, vendas e contatos de exemplo. Apaga o que foi alterado.</p>
        <button type="button" className="btn-ghost text-sm py-2"
          onClick={async () => { if (confirm("Restaurar dados de demonstração? Tudo que foi alterado será perdido.")) { await adminAction("resetDemo"); router.push("/admin"); router.refresh(); } }}>
          Restaurar demonstração
        </button>
      </section>
    </>
  );
}
