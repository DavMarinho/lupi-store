/**
 * Definição das coleções e lançamentos (textos, imagens, pré-venda e contagem). Para criar
 * uma coleção nova, basta adicionar um item aqui.
 */
import type { Product } from "./types";

// Coleções e lançamentos. Para criar uma nova, adicionar aqui.
export type Colecao = {
  slug: string;
  titulo: string;
  chamada: string;
  texto: string;
  tag: "Lançamento" | "Pré-venda" | "Em breve" | "Coleção" | "Esgotado";
  capa: string; // imagem
  fundo: string; // cor do card
  filtro?: (p: Product) => boolean;
  preVenda?: { ate: string; meta: number; confirmados: number; entrega: string };
  emBreve?: { em: string };
};

/** Lista de coleções exibidas no site. 'filtro' escolhe os produtos; 'preVenda' e 'emBreve' ligam contagens regressivas. */
export const COLECOES: Colecao[] = [
  {
    slug: "politecnica-1893",
    titulo: "Politécnica 1893",
    chamada: "Pré-venda aberta",
    texto: "A camiseta oficial da Escola Politécnica, com o monumento de Ramos de Azevedo nas costas. Produção em lote: o pedido fecha quando a pré-venda termina.",
    tag: "Pré-venda",
    capa: "/img/produtos/poli-marinho-costas.webp",
    fundo: "#1c2440",
    filtro: (p) => p.id.startsWith("usp-poli-"),
    preVenda: { ate: "2026-12-20T23:59:00-03:00", meta: 150, confirmados: 112, entrega: "a partir de 15 de janeiro" },
  },
  {
    slug: "inverno",
    titulo: "Inverno",
    chamada: "Toucas de malha canelada",
    texto: "Malha grossa, barra dobrada e o bordado em alto-relevo de cada universidade. Tamanho único. Primeira remessa esgotada.",
    tag: "Esgotado",
    capa: "/img/produtos/usp-touca.webp",
    fundo: "#4b5130",
    filtro: (p) => p.category === "Touca",
  },
  {
    slug: "brasao",
    titulo: "Brasão",
    chamada: "Os moletons bordados",
    texto: "Moletom felpado 100% algodão com bordado em alto-relevo, louros e estrela. A peça-assinatura da LUPi.",
    tag: "Coleção",
    capa: "/img/produtos/ufrj-moletom-brasao.webp",
    fundo: "#d9c4a0",
    filtro: (p) => p.category === "Moletom" && !!p.image,
  },
  {
    slug: "kit-calouro-2027",
    titulo: "Kit Calouro 2027",
    chamada: "Para quem chega em 2027",
    texto: "Camiseta, moletom e touca da sua turma em um kit só. As atléticas parceiras abrem a pré-venda junto com a matrícula.",
    tag: "Em breve",
    capa: "/img/produtos/unesp-moletom-brasao.webp",
    fundo: "#7a1426",
    emBreve: { em: "2027-01-26T10:00:00-03:00" },
  },
];

/** Busca uma coleção pelo slug da URL. */
export const colecao = (slug: string) => COLECOES.find((c) => c.slug === slug);
