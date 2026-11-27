/**
 * Protege todo o painel: sem sessão válida, redireciona para /admin/login. Também calcula
 * quantos contatos não foram lidos.
 */
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { AdminShell } from "./shell";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const db = await readDB();
  const unread = db.contacts.filter((c) => !c.read).length;
  return <AdminShell email={admin} unread={unread}>{children}</AdminShell>;
}
