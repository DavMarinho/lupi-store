/**
 * Política de Privacidade conforme a LGPD (Lei 13.709/2018). Dados da empresa vêm de
 * lib/empresa.ts.
 */
import type { Metadata } from "next";
import { LegalPage, Canal } from "@/components/legal";
import { EMPRESA, aDefinir } from "@/lib/empresa";

export const metadata: Metadata = { title: "Política de Privacidade — LUPi." };

export default function Privacidade() {
  const E = EMPRESA;
  return (
    <LegalPage title="Política de Privacidade" current="/privacidade">
      <p>
        Esta Política explica como a {E.razaoSocial || "LUPI"} (razão social: {aDefinir(E.razaoSocial)}), inscrita no CNPJ {aDefinir(E.cnpj)}, com sede em {aDefinir(E.endereco)} (“LUPI”, “nós”), trata os dados
        pessoais de quem visita e compra em nosso site, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>A LUPI é a controladora dos dados pessoais tratados neste site. </p>
      <p><strong>Encarregado pelo tratamento de dados (DPO):</strong> {aDefinir(E.encarregado)}. Contato do Encarregado: <Canal email={E.emailPrivacidade} assunto="Privacidade e meus dados (LGPD)" />.</p>

      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li><strong>Compra:</strong> nome, e-mail, telefone/WhatsApp, itens comprados e valores. Endereço de entrega, quando aplicável.</li>
        <li><strong>Pagamento:</strong> processado pelo Mercado Pago. A LUPI <strong>não</strong> recebe nem armazena dados de cartão; recebemos apenas a confirmação e o identificador do pagamento.</li>
        <li><strong>Formulários de contato e parcerias:</strong> nome, e-mail, telefone, Instagram, nome da atlética/entidade, cargo e a mensagem enviada.</li>
        <li><strong>Entrega:</strong> CEP e endereço. Ao digitar o CEP no checkout, apenas o CEP é consultado na base pública ViaCEP para preencher o endereço.</li>
        <li><strong>Newsletter:</strong> somente o e-mail, com seu aceite.</li>
        <li><strong>Navegação:</strong> a sacola de compras fica salva apenas no seu navegador (armazenamento local). Registros técnicos de acesso (IP, data e hora) podem ser mantidos pela hospedagem por segurança.</li>
      </ul>
      <p>Não coletamos dados sensíveis (art. 5º, II) e o site não é direcionado a menores de 18 anos sem a participação dos responsáveis.</p>

      <h2>3. Para que usamos e com qual base legal</h2>
      <ul>
        <li><strong>Processar e entregar pedidos, emitir nota fiscal e prestar suporte</strong> — execução de contrato (art. 7º, V) e cumprimento de obrigação legal (art. 7º, II).</li>
        <li><strong>Responder contatos e propostas de parceria</strong> — consentimento (art. 7º, I) e procedimentos preliminares de contrato (art. 7º, V).</li>
        <li><strong>Prevenção a fraudes e segurança do site</strong> — legítimo interesse (art. 7º, IX).</li>
        <li><strong>Comunicações de marketing</strong> — somente com consentimento específico, que pode ser revogado a qualquer momento.</li>
      </ul>

      <h2>4. Com quem compartilhamos</h2>
      <p>Compartilhamos apenas o necessário com: Mercado Pago (pagamentos), Correios (entrega), provedores de hospedagem e envio de e-mail, e autoridades quando exigido por lei. Quando uma compra envolve produto de atlética ou entidade parceira, podemos informar à entidade dados agregados de vendas (quantidade por tamanho, por exemplo), sem identificar compradores. <strong>Não vendemos dados pessoais.</strong></p>
      <p>Alguns desses fornecedores podem armazenar dados fora do Brasil, sempre com garantias adequadas nos termos do art. 33 da LGPD.</p>

      <h2>5. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados de pedidos: pelo prazo legal fiscal e de defesa do consumidor (em regra, 5 anos).</li>
        <li>Contatos e propostas de parceria: até 2 anos após o último contato, ou até você pedir a exclusão.</li>
      </ul>

      <h2>6. Seus direitos (art. 18)</h2>
      <p>Você pode, a qualquer momento e gratuitamente:</p>
      <ul>
        <li>confirmar se tratamos seus dados e acessá-los;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>pedir a portabilidade dos dados;</li>
        <li>pedir a eliminação dos dados tratados com base no consentimento e revogar o consentimento;</li>
        <li>saber com quem compartilhamos seus dados;</li>
        <li>apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</li>
      </ul>
      <p>Para exercer seus direitos, use o <Canal email={E.emailPrivacidade} assunto="Privacidade e meus dados (LGPD)" />. Podemos pedir uma confirmação de identidade para proteger seus dados. Respondemos em até 15 dias.</p>

      <h2 id="cookies">7. Cookies e armazenamento local</h2>
      <p>Usamos apenas recursos <strong>estritamente necessários</strong>: o armazenamento local do navegador para manter sua sacola e lembrar que você viu o aviso de cookies, e um cookie de sessão exclusivo da área administrativa. Não usamos cookies de publicidade, de rastreamento ou de terceiros para análise. Se isso mudar, pediremos seu consentimento antes.</p>

      <h2>8. Segurança</h2>
      <p>Adotamos medidas técnicas e administrativas para proteger seus dados: conexão criptografada (HTTPS), acesso restrito à área administrativa, senhas protegidas e pagamentos processados em ambiente certificado do Mercado Pago. Em caso de incidente de segurança relevante, comunicaremos os titulares e a ANPD conforme o art. 48.</p>

      <h2>9. Alterações</h2>
      <p>Podemos atualizar esta Política. A data no topo indica a versão vigente, e mudanças relevantes serão comunicadas no site.</p>
    </LegalPage>
  );
}
