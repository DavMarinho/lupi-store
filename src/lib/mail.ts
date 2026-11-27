/**
 * Envio de e-mail pela API do Resend. Sem chave configurada, o contato fica só salvo no
 * painel.
 */
import "server-only";

// Envia e-mail via Resend (https://resend.com) se RESEND_API_KEY estiver configurada.
export async function sendMail(to: string, subject: string, html: string, replyTo?: string): Promise<"sent" | "queued" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return "queued"; // sem configuração: fica salvo no painel
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "LUPi. <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return r.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

/** Escapa HTML para que o texto digitado pelo visitante não vire código no e-mail. */
export function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
