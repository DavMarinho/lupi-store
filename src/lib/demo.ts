/**
 * Leitura do resumo do pedido de demonstração que viaja na URL (cada função da Vercel tem
 * seu próprio armazenamento temporário).
 */
export type DemoOrder = { id: string; total: number; name: string; items: { n: string; s: string; q: number }[] };

export function parseDemo(d?: string | null): DemoOrder | null {
  if (!d) return null;
  try {
    const o = JSON.parse(Buffer.from(d, "base64url").toString());
    if (typeof o.id !== "string" || typeof o.total !== "number" || !Array.isArray(o.items)) return null;
    return o;
  } catch {
    return null;
  }
}
