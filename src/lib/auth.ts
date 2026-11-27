/**
 * Login dos donos da loja (área /admin).
 *
 * Como funciona:
 *  - As credenciais vêm de variáveis de ambiente (ADMIN_EMAIL, ADMIN_PASSWORD).
 *  - Ao entrar, geramos um token "payload.assinatura" (HMAC-SHA256) e guardamos
 *    num cookie httpOnly. Não há tabela de sessões: o servidor só confere a assinatura.
 *  - O token expira em 12 horas.
 *
 * Segurança:
 *  - Em produção, se as variáveis não existirem, o login é BLOQUEADO (não há senha padrão).
 *  - Só em desenvolvimento local usamos valores padrão, para facilitar o primeiro teste.
 *  - A comparação é feita em tempo constante (safeEqual) para evitar ataques de timing.
 */
import "server-only";
import { cookies } from "next/headers";

const COOKIE = "lupi_admin";
const MAX_AGE = 60 * 60 * 12; // 12 horas, em segundos
const isProd = process.env.NODE_ENV === "production";

/** Chave usada para assinar o cookie. Obrigatória em produção. */
function secret() {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (isProd) throw new Error("AUTH_SECRET não configurado");
  return "dev-secret-somente-local";
}

/** Assina um texto com HMAC-SHA256 e devolve em base64url. */
async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

/** Compara dois textos em tempo constante (não vaza onde a diferença está). */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Confere e-mail e senha informados contra as variáveis de ambiente. */
export function checkCredentials(email: string, password: string) {
  const e = process.env.ADMIN_EMAIL ?? (isProd ? "" : "admin@lupi.com.br");
  const p = process.env.ADMIN_PASSWORD ?? (isProd ? "" : "lupi-local");
  if (!e || !p) return false; // produção sem configuração: ninguém entra
  return safeEqual(email.trim().toLowerCase(), e.toLowerCase()) && safeEqual(password, p);
}

/** Cria o cookie de sessão do administrador. */
export async function createSession(email: string) {
  const payload = `${email}|${Date.now() + MAX_AGE * 1000}`; // e-mail + validade
  const token = `${Buffer.from(payload).toString("base64url")}.${await sign(payload)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, // JavaScript do navegador não consegue ler
    sameSite: "lax", // proteção básica contra CSRF
    secure: isProd, // só por HTTPS em produção
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Encerra a sessão (apaga o cookie). */
export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Devolve o e-mail do admin logado, ou null se não houver sessão válida. */
export async function getAdmin(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, "base64url").toString();
  if (!safeEqual(sig, await sign(payload))) return null; // assinatura inválida
  const [email, exp] = payload.split("|");
  if (Number(exp) < Date.now()) return null; // expirou
  return email;
}
