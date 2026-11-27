/**
 * Layout das páginas públicas da loja: navbar, conteúdo, faixa de newsletter, rodapé, sacola
 * lateral e aviso de cookies.
 */
import { Nav, Footer } from "@/components/nav";
import { CartDrawer } from "@/components/cart-drawer";
import { CookieBanner } from "@/components/consent";
import { Newsletter } from "@/components/newsletter";

export default function LojaLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Newsletter />
      <Footer />
      <CartDrawer />
      <CookieBanner />
    </>
  );
}
