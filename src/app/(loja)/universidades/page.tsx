/**
 * Lista as universidades, cada uma com uma foto de moletom e a quantidade de peças.
 */
import Link from "next/link";
import { readDB } from "@/lib/db";
import { Garment } from "@/components/garment";

export const dynamic = "force-dynamic";

export default async function Universidades() {
  const db = await readDB();
  return (
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 py-10 md:py-16">
      <h1 className="text-5xl md:text-7xl tracking-tight">Universidades.</h1>
      <p className="mt-3 text-muted max-w-xl">Escolha a sua e veja tudo que temos com o seu brasão.</p>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {db.universities.map((u) => {
          const p = db.products.find((x) => x.universityId === u.id && x.category === "Moletom");
          const n = db.products.filter((x) => x.universityId === u.id && x.active).length;
          return (
            <Link key={u.id} href={`/colecao?u=${u.id}`} className="group block">
              <div className="aspect-square bg-[#f1efea] overflow-hidden">
                {p?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]" />
                ) : (<Garment category="Moletom" fabric={p?.fabric ?? "#ddd"} color={u.color} label={u.name}
                  className="w-full h-full p-6 transition-transform duration-700 group-hover:scale-[1.05]" />)}
              </div>
              <p className="mt-3 text-2xl md:text-3xl group-hover:text-wine transition-colors">{u.name}</p>
              <p className="font-sans text-xs text-muted">{u.fullName} · {n} peças</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-20 border-t border-line pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <p className="text-2xl md:text-3xl max-w-xl">Não achou a sua? Atléticas podem lançar uma coleção com a gente.</p>
        <Link href="/atleticas" className="btn-primary">Falar com a LUPi. <span>⟶</span></Link>
      </div>
    </div>
  );
}
