/**
 * Função auxiliar que chama /api/admin e lança erro com a mensagem do servidor.
 */
export async function adminAction<T = { ok: boolean }>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const r = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Erro");
  return d as T;
}
