/**
 * Dados oficiais da empresa usados no rodapé e nos textos legais. Campo vazio aparece como
 * 'a definir' no site.
 */
// Dados da empresa usados no site e nos textos legais.
// ⚠ Preencher antes do lançamento. Campo vazio = o site mostra "a definir"
// e direciona o atendimento para o formulário de Contato (que cai no admin).
export const EMPRESA = {
  nome: "LUPI",
  razaoSocial: "", // ex.: "LUPI Comércio de Vestuário Ltda."
  cnpj: "",
  endereco: "", // endereço físico completo (Decreto 7.962/2013, art. 2º)
  email: "", // e-mail de atendimento
  emailPrivacidade: "", // e-mail do Encarregado (LGPD, art. 41)
  encarregado: "", // nome do Encarregado pelo tratamento de dados
  whatsapp: "", // ex.: "5511999999999"
  instagram: "", // sem @
  atualizado: "27 de novembro de 2026",
};

export const aDefinir = (v: string) => v || "a definir";
