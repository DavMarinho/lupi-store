/**
 * Caixa de entrada: mensagens da página Contato, propostas de atléticas e lista de inscritos
 * na newsletter.
 */
import { readDB } from "@/lib/db";
import { ContactItem } from "./item";

export const dynamic = "force-dynamic";

export default async function Contatos() {
  const db = await readDB();
  return (
    <div className="max-w-[1000px]">
      <h1 className="font-serif text-4xl md:text-5xl">Contatos e atléticas</h1>
      <p className="text-sm text-muted mt-1 mb-6">
        Mensagens da página Contato e propostas de atléticas. {db.settings.contactEmail ? <>Encaminhando para <strong>{db.settings.contactEmail}</strong>.</> : "Cadastre um e-mail em Configurações para receber cópias."}
      </p>
      {db.contacts.length === 0 ? <p className="text-muted">Nenhum contato ainda.</p> : (
        <div className="space-y-3">{db.contacts.map((c) => <ContactItem key={c.id} c={c} />)}</div>
      )}
      <section className="mt-10 bg-white border border-line p-5">
        <h2 className="font-serif text-2xl">Newsletter <span className="font-sans text-sm text-muted">({(db.newsletter ?? []).length})</span></h2>
        {(db.newsletter ?? []).length === 0 ? <p className="text-sm text-muted mt-2">Nenhum inscrito ainda.</p> : (
          <ul className="mt-3 text-sm divide-y divide-line">
            {(db.newsletter ?? []).map((s) => (
              <li key={s.email} className="py-2 flex justify-between gap-3"><span className="truncate">{s.email}</span><span className="text-muted shrink-0">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</span></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
