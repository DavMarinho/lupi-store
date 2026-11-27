/**
 * Banco de dados do MVP: um único JSON. Em desenvolvimento fica em data/db.json; na Vercel
 * fica no Vercel Blob. Em produção real, trocar por Postgres.
 */
import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { DB } from "./types";
import { buildSeed } from "./seed";

// Local: arquivo JSON em data/. Na Vercel: um único JSON no Vercel Blob (privado),
// compartilhado por todas as funções. MVP — trocar por Postgres ao lançar.
const FILE = path.join(process.cwd(), "data", "db.json");
const BLOB_PATH = "lupi/db.json";
const useBlob = !!process.env.VERCEL && !!process.env.BLOB_READ_WRITE_TOKEN;

/** Lê o JSON do banco (Blob na Vercel, arquivo local no resto). Devolve null se ainda não existir. */
async function load(): Promise<string | null> {
  if (useBlob) {
    const { get } = await import("@vercel/blob");
    const r = await get(BLOB_PATH, { access: "private", useCache: false }).catch(() => null);
    if (!r || r.statusCode !== 200) return null;
    return await new Response(r.stream).text();
  }
  return fs.readFile(FILE, "utf8").catch(() => null);
}

/** Grava o banco inteiro. Local: escreve num arquivo temporário e renomeia, para não corromper em caso de falha. */
async function save(db: DB) {
  const body = JSON.stringify(db);
  if (useBlob) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, body, { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json" });
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

/** Lê o banco. Na primeira execução cria tudo a partir dos dados de demonstração (seed). */
export async function readDB(): Promise<DB> {
  const raw = await load();
  if (raw) {
    try { return JSON.parse(raw) as DB; } catch {}
  }
  const seed = buildSeed();
  await save(seed);
  return seed;
}

let queue: Promise<unknown> = Promise.resolve();

// Escritas serializadas (por instância) para não corromper os dados
export function updateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

/** Gera um identificador curto e único (prefixo + data em base 36 + aleatório). */
export function uid(prefix = "") {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}
