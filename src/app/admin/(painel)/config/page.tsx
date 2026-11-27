/**
 * Configurações: e-mail que recebe os contatos e status das integrações (Mercado Pago e
 * e-mail).
 */
import { readDB } from "@/lib/db";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function Config() {
  const db = await readDB();
  return (
    <div className="max-w-[720px] space-y-6">
      <h1 className="font-serif text-4xl md:text-5xl">Configurações</h1>
      <SettingsForm contactEmail={db.settings.contactEmail} />
      <section className="bg-white border border-line p-5 md:p-6 text-sm space-y-2">
        <h2 className="font-serif text-2xl mb-2">Integrações</h2>
        <p>Mercado Pago: <strong>{process.env.MP_ACCESS_TOKEN ? (process.env.MP_ACCESS_TOKEN.startsWith("TEST-") ? "conectado (teste)" : "conectado") : "modo demonstração"}</strong></p>
        <p>Envio de e-mail (Resend): <strong>{process.env.RESEND_API_KEY ? "configurado" : "não configurado"}</strong></p>
        <p className="text-muted">As chaves ficam no arquivo <code>.env.local</code>, nunca no painel.</p>
      </section>
    </div>
  );
}
