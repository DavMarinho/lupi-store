/**
 * Dados de demonstração: universidades, produtos com fotos e vendas fictícias para o
 * dashboard não ficar vazio. É gerado de forma determinística.
 */
import type { DB, Product, Order, Size, University, Category } from "./types";

const universities: University[] = [
  { id: "usp", name: "USP", fullName: "Universidade de São Paulo", color: "#f3ead8" },
  { id: "unicamp", name: "UNICAMP", fullName: "Universidade Estadual de Campinas", color: "#7a1426" },
  { id: "unesp", name: "UNESP", fullName: "Universidade Estadual Paulista", color: "#1c2a4f" },
  { id: "ufrj", name: "UFRJ", fullName: "Universidade Federal do Rio de Janeiro", color: "#1f5a35" },
  { id: "uerj", name: "UERJ", fullName: "Universidade do Estado do Rio de Janeiro", color: "#f3ead8" },
  { id: "puc-rio", name: "PUC-Rio", fullName: "Pontifícia Universidade Católica do Rio", color: "#1c2a4f" },
];

const fabrics: Record<string, string> = {
  usp: "#1c2440",
  unicamp: "#c9c9c7",
  unesp: "#d9c4a0",
  ufrj: "#ece3cf",
  uerj: "#4b5130",
  "puc-rio": "#cfcfcd",
};

const lines: { cat: Category; name: string; price: number; desc: string }[] = [
  { cat: "Moletom", name: "Moletom Clássico", price: 249.9, desc: "Moletom felpado 100% algodão, bordado frontal em alto-relevo com louros. Caimento reto e punhos canelados." },
  { cat: "Polo", name: "Polo Rugby", price: 279.9, desc: "Polo de manga longa em malha pesada, gola em sarja e bordado no peito. Inspirada no rugby universitário." },
  { cat: "Camiseta", name: "Camiseta Heritage", price: 129.9, desc: "Camiseta em algodão penteado 30.1, estampa frontal em silk de toque macio." },
  { cat: "Jaqueta", name: "Varsity Jacket", price: 389.9, desc: "Jaqueta college em lã batida com mangas em sarja, botões de pressão e patch bordado." },
  { cat: "Boné", name: "Boné Dad Hat", price: 99.9, desc: "Boné de aba curva em sarja lavada, bordado frontal e regulagem em metal." },
];

/** Gerador pseudoaleatório com semente fixa: as vendas de demonstração são sempre as mesmas. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Monta o banco de demonstração: produtos com fotos, regatas, shorts, croppeds, toucas, bonés e 520 vendas fictícias. */
export function buildSeed(): DB {
  const products: Product[] = [];
  const now = Date.now();
  universities.forEach((u, ui) => {
    lines.forEach((l, li) => {
      const sizes: Size[] = l.cat === "Boné" ? ["U"] : ["PP", "P", "M", "G", "GG", "XG"];
      const stock: Partial<Record<Size, number>> = {};
      sizes.forEach((s) => (stock[s] = 10 + ((ui * 7 + li * 3) % 25)));
      products.push({
        id: `${u.id}-${l.cat.toLowerCase().replace("é", "e")}`,
        slug: `${l.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}-${u.id}`,
        name: `${l.name} ${u.name}`,
        description: l.desc,
        universityId: u.id,
        category: l.cat,
        price: l.price,
        discount:
          (ui + li) % 5 === 0
            ? { type: "percent", value: 20 }
            : (ui + li) % 7 === 3
              ? { type: "fixed", value: 30 }
              : null,
        sizes,
        stock,
        fabric: l.cat === "Moletom" || l.cat === "Polo" ? fabrics[u.id] : ["#f4f1ea", "#1c2440", "#2b2b2b"][(ui + li) % 3],
        active: true,
        createdAt: new Date(now - (ui * 5 + li) * 86400000).toISOString(),
      });
    });
  });

  // Fotos reais das peças (mockups oficiais LUPI)
  const photos: Record<string, string> = {
    "usp-moletom": "/img/produtos/usp-moletom-rugby.webp",
    "uerj-moletom": "/img/produtos/uerj-moletom.webp",
    "unesp-moletom": "/img/produtos/unesp-moletom.webp",
    "ufrj-moletom": "/img/produtos/ufrj-moletom.webp",
    "puc-rio-moletom": "/img/produtos/puc-rio-moletom.webp",
    "unicamp-moletom": "/img/produtos/unicamp-moletom.webp",
  };
  for (const u of universities) photos[`${u.id}-bone`] = `/img/produtos/${u.id}-bone.webp`;
  products.forEach((p) => { if (photos[p.id]) p.image = photos[p.id]; });
  const usp = products.find((p) => p.id === "usp-moletom")!;
  usp.name = "Moletom Rugby USP";
  usp.slug = "moletom-rugby-usp";
  usp.description = "Moletom felpado com gola polo em sarja creme e botões. Bordado frontal USP em alto-relevo com louros e estrela.";
  for (const [uid, fabric] of [["ufrj", "#ece3cf"], ["unesp", "#d9c4a0"]] as const) {
    const sizes: Size[] = ["PP", "P", "M", "G", "GG", "XG"];
    products.unshift({
      id: `${uid}-moletom-brasao`,
      slug: `moletom-brasao-${uid}`,
      name: `Moletom Brasão ${uid.toUpperCase()}`,
      description: "Edição Brasão: bordado em alto-relevo com coroa de louros cruzados e estrela. Moletom felpado 100% algodão, caimento oversized.",
      universityId: uid,
      category: "Moletom",
      price: 269.9,
      discount: null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 18])),
      fabric,
      image: `/img/produtos/${uid}-moletom-brasao.webp`,
      active: true,
      createdAt: new Date(now).toISOString(),
    });
  }

  for (const [cor, fabric, preco] of [["Marinho", "#1c2440", 119.9], ["Creme", "#ece3cf", 119.9]] as const) {
    const slug = cor.toLowerCase();
    const sizes: Size[] = ["PP", "P", "M", "G", "GG", "XG"];
    products.unshift({
      id: `usp-poli-camiseta-${slug}`,
      slug: `camiseta-politecnica-${slug}`,
      name: `Camiseta Politécnica ${cor}`,
      description: `Camiseta da Escola Politécnica da USP. Brasão da Poli no peito e arte do monumento de Ramos de Azevedo nas costas, com a inscrição “Escola · USP · 1893”. Malha dry-fit leve${cor === "Creme" ? ", com friso azul nas mangas" : ""}.`,
      universityId: "usp",
      category: "Camiseta",
      price: preco,
      discount: cor === "Creme" ? { type: "percent", value: 10 } : null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 25])),
      fabric,
      image: `/img/produtos/poli-${slug}-frente.webp`,
      images: [`/img/produtos/poli-${slug}-frente.webp`, `/img/produtos/poli-${slug}-costas.webp`],
      active: true,
      createdAt: new Date(now + 1000).toISOString(),
    });
  }

  // Toucas (Coleção Inverno)
  const toucas: [string, string][] = [["usp", "#1c2440"], ["unicamp", "#bdbdbd"], ["unesp", "#d9c4a0"], ["ufrj", "#ece3cf"], ["uerj", "#4b5130"], ["puc-rio", "#bdbdbd"]];
  for (const [uid, fabric] of toucas) {
    const u = universities.find((x) => x.id === uid)!;
    products.unshift({
      id: `${uid}-touca`,
      slug: `touca-${uid}`,
      name: `Touca ${u.name}`,
      description: "Touca em malha canelada grossa com barra dobrada e bordado frontal em alto-relevo com louros e estrela. Tamanho único, confortável e quente.",
      universityId: uid,
      category: "Touca",
      price: 89.9,
      discount: null,
      sizes: ["U"],
      stock: { U: 0 }, // esgotada
      fabric,
      image: `/img/produtos/${uid}-touca.webp`,
      active: true,
      createdAt: new Date(now + 2000).toISOString(),
    });
  }

  {
    const sizes: Size[] = ["PP", "P", "M", "G", "GG", "XG"];
    products.unshift({
      id: "usp-camiseta-bordo",
      slug: "camiseta-logo-usp-bordo",
      name: "Camiseta Logo USP Bordô",
      description: "Camiseta em algodão penteado com o logo USP contornado em branco no peito. Costas lisas, caimento regular.",
      universityId: "usp",
      category: "Camiseta",
      price: 109.9,
      discount: null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 30])),
      fabric: "#5e0f1d",
      image: "/img/produtos/usp-camiseta-bordo-frente.webp",
      images: ["/img/produtos/usp-camiseta-bordo-frente.webp", "/img/produtos/usp-camiseta-bordo-costas.webp"],
      active: true,
      createdAt: new Date(now + 3000).toISOString(),
    });
  }
  // Regatas de basquete
  const regatas: [string, string, string][] = [["usp", "07", "#5e0f1d"], ["unicamp", "12", "#c9c9c7"], ["unesp", "23", "#d9c4a0"], ["ufrj", "10", "#ece3cf"], ["uerj", "08", "#4b5130"], ["puc-rio", "21", "#1c2440"]];
  for (const [uid, num, fabric] of regatas) {
    const u = universities.find((x) => x.id === uid)!;
    const sizes: Size[] = ["PP", "P", "M", "G", "GG", "XG"];
    products.unshift({
      id: `${uid}-regata`,
      slug: `regata-basquete-${uid}`,
      name: `Regata Basquete ${u.name} #${num}`,
      description: `Regata de basquete em tela dry-fit furadinha, gola V e cavas com friso listrado. ${u.name} e número ${num} na frente, número grande nas costas e brasão no peito.`,
      universityId: uid,
      category: "Regata",
      price: 149.9,
      discount: null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 20])),
      fabric,
      image: `/img/produtos/${uid}-regata-frente.webp`,
      images: [`/img/produtos/${uid}-regata-frente.webp`, `/img/produtos/${uid}-regata-costas.webp`],
      active: true,
      createdAt: new Date(now + 4000).toISOString(),
    });
  }
  // Shorts de basquete (combinam com as regatas)
  const shorts: [string, string, string][] = [["usp", "07", "#5e0f1d"], ["unicamp", "12", "#c9c9c7"], ["unesp", "23", "#d9c4a0"], ["ufrj", "10", "#ece3cf"], ["uerj", "08", "#4b5130"], ["puc-rio", "21", "#1c2440"]];
  for (const [uid, num, fabric] of shorts) {
    const u = universities.find((x) => x.id === uid)!;
    const sizes: Size[] = ["PP", "P", "M", "G", "GG", "XG"];
    products.unshift({
      id: `${uid}-short`,
      slug: `short-basquete-${uid}`,
      name: `Short Basquete ${u.name} #${num}`,
      description: `Short de basquete em malha dry-fit leve, com faixas laterais contrastantes, cós elástico com cordão, brasão ${u.name} e número ${num}. Combina com a regata da coleção.`,
      universityId: uid,
      category: "Short",
      price: 119.9,
      discount: null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 20])),
      fabric,
      image: `/img/produtos/${uid}-short-frente.webp`,
      images: [`/img/produtos/${uid}-short-frente.webp`, `/img/produtos/${uid}-short-costas.webp`],
      active: true,
      createdAt: new Date(now + 5000).toISOString(),
    });
  }
  // Croppeds esportivos (combinam com regata e short)
  const croppeds: [string, string][] = [["usp", "#5e0f1d"], ["unicamp", "#c9c9c7"], ["unesp", "#d9c4a0"], ["ufrj", "#ece3cf"], ["uerj", "#4b5130"], ["puc-rio", "#1c2440"]];
  for (const [uid, fabric] of croppeds) {
    const u = universities.find((x) => x.id === uid)!;
    const sizes: Size[] = ["PP", "P", "M", "G", "GG"];
    products.unshift({
      id: `${uid}-cropped`,
      slug: `cropped-esportivo-${uid}`,
      name: `Cropped Esportivo ${u.name}`,
      description: `Cropped esportivo com decote quadrado, vivos contrastantes nas alças e laterais, barra em elástico e ${u.name} aplicado em relevo. Malha com elastano, ajuste confortável.`,
      universityId: uid,
      category: "Cropped",
      price: 99.9,
      discount: null,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, 20])),
      fabric,
      image: `/img/produtos/${uid}-cropped-frente.webp`,
      images: [`/img/produtos/${uid}-cropped-frente.webp`, `/img/produtos/${uid}-cropped-costas.webp`],
      active: true,
      createdAt: new Date(now + 6000).toISOString(),
    });
  }
  // Catálogo só com peças que têm foto
  for (let i = products.length - 1; i >= 0; i--) if (!products[i].image) products.splice(i, 1);

  // Vendas de demonstração (90 dias) para o dashboard não ficar vazio
  const r = rng(42);
  const uniWeight = [0.3, 0.2, 0.15, 0.15, 0.1, 0.1];
  const catWeight = [0.42, 0.18, 0.22, 0.08, 0.1];
  const sizeWeight: [Size, number][] = [["PP", 0.06], ["P", 0.18], ["M", 0.34], ["G", 0.26], ["GG", 0.12], ["XG", 0.04]];
  const pick = <T,>(arr: T[], w: number[]) => {
    let x = r();
    for (let i = 0; i < arr.length; i++) { x -= w[i]; if (x <= 0) return arr[i]; }
    return arr[arr.length - 1];
  };
  const names = ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Prado", "Felipe Nunes", "Gabi Torres", "Heitor Melo", "Isabela Reis", "João Pires"];
  const orders: Order[] = [];
  for (let i = 0; i < 520; i++) {
    const n = 1 + Math.floor(r() * 3);
    const items = Array.from({ length: n }, () => {
      const u = pick(universities, uniWeight);
      const l = pick(lines, catWeight);
      const daUni = products.filter((x) => x.universityId === u.id);
      const p = daUni.find((x) => x.category === l.cat) ?? daUni[Math.floor(r() * daUni.length)];
      const size = p.sizes.length === 1 ? p.sizes[0] : pick(sizeWeight.map((s) => s[0]), sizeWeight.map((s) => s[1]));
      const price = p.discount ? (p.discount.type === "percent" ? p.price * (1 - p.discount.value / 100) : p.price - p.discount.value) : p.price;
      return { productId: p.id, name: p.name, universityId: u.id, size: size as Size, qty: r() < 0.85 ? 1 : 2, unitPrice: Math.round(price * 100) / 100 };
    });
    const cust = names[Math.floor(r() * names.length)];
    orders.push({
      id: `DEMO${(1000 + i).toString()}`,
      createdAt: new Date(now - Math.floor(r() * 90) * 86400000 - Math.floor(r() * 86400000)).toISOString(),
      status: r() < 0.92 ? "paid" : "pending",
      customer: { name: cust, email: `${cust.split(" ")[0].toLowerCase()}@exemplo.com`, phone: "(11) 90000-0000" },
      items,
      total: Math.round(items.reduce((s, it) => s + it.unitPrice * it.qty, 0) * 100) / 100,
      demo: true,
    });
  }

  return {
    universities,
    products,
    orders,
    contacts: [
      {
        id: "c-demo-1",
        createdAt: new Date(now - 2 * 86400000).toISOString(),
        athletic: "Atlética XI de Agosto",
        university: "USP",
        name: "Marina Costa",
        role: "Diretora de produtos",
        email: "produtos@exemplo.com",
        phone: "(11) 98888-0000",
        instagram: "@aaa_exemplo",
        members: "300+",
        message: "Queremos lançar uma linha de moletons para o InterUSP. Vocês trabalham com pedido mínimo?",
        emailStatus: "queued",
        read: false,
      },
    ],
    settings: { contactEmail: "", storeName: "LUPi." },
  };
}
