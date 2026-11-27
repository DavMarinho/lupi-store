/**
 * Cartão de um contato. Permite marcar como lido e excluir (atende pedidos de exclusão de
 * dados da LGPD).
 */
"use client";

import { useRouter } from "next/navigation";
import { adminAction } from "@/components/admin-api";
import type { Contact } from "@/lib/types";

const mail = { sent: "E-mail enviado", queued: "Aguardando e-mail configurado", failed: "Falha no envio" };

export function ContactItem({ c }: { c: Contact }) {
  const router = useRouter();
  const geral = c.kind === "geral";
  const toggle = async () => { await adminAction("markContact", { id: c.id, read: !c.read }); router.refresh(); };
  const remove = async () => {
    if (!confirm("Excluir este contato e os dados pessoais dele? Use para pedidos de exclusão (LGPD). Não pode ser desfeito.")) return;
    await adminAction("deleteContact", { id: c.id });
    router.refresh();
  };
  return (
    <article className={`bg-white border p-5 ${c.read ? "border-line" : "border-wine/40"}`}>
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${geral ? "bg-bg text-muted border border-line" : "bg-wine/10 text-wine"}`}>{geral ? "Contato" : "Atlética"}</span>
          <h2 className="font-serif text-2xl mt-1">
            {!c.read && <span className="inline-block w-2 h-2 rounded-full bg-wine mr-2 align-middle" />}
            {geral ? c.subject || "Mensagem" : c.athletic}
          </h2>
          <p className="text-sm text-muted">
            {geral ? (c.order ? `Pedido ${c.order} · ` : "") : `${c.university} · ${c.members} membros · `}
            {new Date(c.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span className="text-xs text-muted">{mail[c.emailStatus]}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed border-l-2 border-wine pl-3">{c.message}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span>{c.name}{c.role ? ` (${c.role})` : ""}</span>
        <a href={`mailto:${c.email}`} className="underline">{c.email}</a>
        {c.phone && <a href={`https://wa.me/55${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="underline">WhatsApp</a>}
        {c.instagram && <span className="text-muted">{c.instagram}</span>}
        <span className="ml-auto flex gap-4">
          <button onClick={toggle} className="text-muted underline">{c.read ? "Marcar como não lido" : "Marcar como lido"}</button>
          <button onClick={remove} className="text-wine underline">Excluir</button>
        </span>
      </div>
      {c.consentAt && <p className="mt-2 text-[11px] text-muted">Consentimento LGPD registrado em {new Date(c.consentAt).toLocaleString("pt-BR")}</p>}
    </article>
  );
}
