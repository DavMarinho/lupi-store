/**
 * Estado global da sacola (Context). Fica salvo no localStorage do navegador, então não
 * exige login.
 */
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Size } from "@/lib/types";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  universityId: string;
  size: Size;
  qty: number;
  unitPrice: number;
  originalPrice: number;
  fabric: string;
  color: string;
  label: string;
  category: string;
  image?: string;
};

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (l: CartLine) => void;
  setQty: (productId: string, size: Size, qty: number) => void;
  remove: (productId: string, size: Size) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "lupi_cart_v1";

/** Guarda a sacola em estado React e sincroniza com o localStorage (chave lupi_cart_v1). Limita a 10 unidades por item. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const value = useMemo<Ctx>(() => {
    const same = (a: CartLine, id: string, s: Size) => a.productId === id && a.size === s;
    return {
      lines,
      open,
      setOpen,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: Math.round(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 100) / 100,
      add: (l) =>
        setLines((cur) => {
          const ex = cur.find((c) => same(c, l.productId, l.size));
          if (ex) return cur.map((c) => (same(c, l.productId, l.size) ? { ...c, qty: Math.min(10, c.qty + l.qty) } : c));
          return [...cur, l];
        }),
      setQty: (id, s, qty) =>
        setLines((cur) => cur.map((c) => (same(c, id, s) ? { ...c, qty: Math.max(1, Math.min(10, qty)) } : c))),
      remove: (id, s) => setLines((cur) => cur.filter((c) => !same(c, id, s))),
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/** Hook para acessar a sacola em qualquer componente. Só funciona dentro do CartProvider. */
export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
}
