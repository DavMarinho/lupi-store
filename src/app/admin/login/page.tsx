/**
 * Tela de login dos donos da loja. Envia e-mail e senha para /api/admin (ação login).
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { adminAction } from "@/components/admin-api";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await adminAction("login", { email: f.get("email"), password: f.get("password") });
      window.location.href = "/admin";
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 fade-up">
        <Link href="/" className="font-bold text-5xl block">LUPi.</Link>
        <p className="text-muted">Área dos administradores</p>
        <div><label className="label">E-mail</label><input name="email" type="email" required className="field" autoComplete="username" /></div>
        <div><label className="label">Senha</label><input name="password" type="password" required className="field" autoComplete="current-password" /></div>
        {error && <p className="font-sans text-sm text-wine">{error}</p>}
        <button disabled={loading} className="btn-primary w-full h-12">{loading ? "Entrando…" : "Entrar"}</button>
        <Link href="/" className="block text-center font-sans text-xs text-muted underline">Voltar para a loja</Link>
      </form>
    </div>
  );
}
