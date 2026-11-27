/**
 * Estimativa de frete (PAC e SEDEX) por região do CEP e peso, nos moldes da tabela dos
 * Correios saindo de São Paulo. Para valores exatos, trocar pela API dos Correios.
 */
// Frete estimado com base na tabela de balcão dos Correios (PAC e SEDEX),
// saindo de São Paulo/SP. A região é descoberta pela faixa do CEP — sem chamada externa.
// Quando houver contrato com os Correios, trocar por consulta à API oficial de preço/prazo.

export type Regiao = "SP" | "Sudeste" | "Sul" | "Centro-Oeste" | "Nordeste" | "Norte";
export type Servico = "PAC" | "SEDEX";
export type Cotacao = { servico: Servico; preco: number; prazo: string; gratis: boolean };

export const FRETE_GRATIS_ACIMA = 399; // PAC grátis acima deste subtotal

export const PESO_KG: Record<string, number> = {
  Moletom: 0.7, Polo: 0.5, Camiseta: 0.3, Jaqueta: 1.0, Boné: 0.25, Touca: 0.2, Regata: 0.25, Short: 0.3, Cropped: 0.2,
};

// faixas de CEP (5 primeiros dígitos)
const FAIXAS: [number, number, Regiao][] = [
  [1000, 19999, "SP"],
  [20000, 39999, "Sudeste"], // RJ, ES, MG
  [40000, 65999, "Nordeste"], // BA, SE, PE, AL, PB, RN, CE, PI, MA
  [66000, 69999, "Norte"], // PA, AP, AM, RR, AC
  [70000, 76799, "Centro-Oeste"], // DF, GO
  [76800, 76999, "Norte"], // RO
  [77000, 77999, "Norte"], // TO
  [78000, 79999, "Centro-Oeste"], // MT, MS
  [80000, 99999, "Sul"], // PR, SC, RS
];

// [preço base até 0,5 kg, adicional por kg, prazo em dias úteis]
const TABELA: Record<Regiao, Record<Servico, [number, number, string]>> = {
  SP: { PAC: [21.9, 6, "3 a 5"], SEDEX: [26.9, 9, "1 a 2"] },
  Sudeste: { PAC: [27.9, 8, "5 a 7"], SEDEX: [41.9, 14, "2 a 3"] },
  Sul: { PAC: [31.9, 9, "6 a 8"], SEDEX: [51.9, 17, "3 a 4"] },
  "Centro-Oeste": { PAC: [35.9, 10, "6 a 9"], SEDEX: [61.9, 20, "3 a 5"] },
  Nordeste: { PAC: [41.9, 12, "8 a 12"], SEDEX: [77.9, 25, "3 a 6"] },
  Norte: { PAC: [51.9, 15, "9 a 14"], SEDEX: [97.9, 31, "4 a 8"] },
};

/** Remove tudo que não é número e limita a 8 dígitos. */
export function limpaCep(cep: string) {
  return (cep || "").replace(/\D/g, "").slice(0, 8);
}

/** Descobre a região de entrega pela faixa do CEP. Devolve null se o CEP for inválido. */
export function regiaoDoCep(cep: string): Regiao | null {
  const c = limpaCep(cep);
  if (c.length !== 8) return null;
  const n = Number(c.slice(0, 5));
  return FAIXAS.find(([a, b]) => n >= a && n <= b)?.[2] ?? null;
}

/** Soma o peso das peças (por tipo) mais 150 g de embalagem. */
export function pesoTotal(itens: { category: string; qty: number }[]) {
  return itens.reduce((s, i) => s + (PESO_KG[i.category] ?? 0.5) * i.qty, 0) + 0.15; // + embalagem
}

/** Calcula PAC e SEDEX para o CEP e peso informados. O PAC fica grátis acima de FRETE_GRATIS_ACIMA. */
export function cotar(cep: string, peso: number, subtotal: number): Cotacao[] | null {
  const r = regiaoDoCep(cep);
  if (!r) return null;
  return (["PAC", "SEDEX"] as Servico[]).map((s) => {
    const [base, kg, prazo] = TABELA[r][s];
    const preco = Math.round((base + Math.max(0, Math.ceil((peso - 0.5) * 2) / 2) * kg) * 100) / 100;
    const gratis = s === "PAC" && subtotal >= FRETE_GRATIS_ACIMA;
    return { servico: s, preco: gratis ? 0 : preco, prazo: `${prazo} dias úteis`, gratis };
  });
}

/** Formata o CEP enquanto a pessoa digita (00000-000). */
export function mascaraCep(v: string) {
  const d = limpaCep(v);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
