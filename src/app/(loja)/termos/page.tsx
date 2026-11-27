/**
 * Termos de Uso conforme o Código de Defesa do Consumidor e o Decreto 7.962/2013 (comércio
 * eletrônico).
 */
import type { Metadata } from "next";
import { LegalPage, Canal } from "@/components/legal";
import { EMPRESA, aDefinir } from "@/lib/empresa";

export const metadata: Metadata = { title: "Termos de Uso — LUPi." };

export default function Termos() {
  const E = EMPRESA;
  return (
    <LegalPage title="Termos de Uso" current="/termos">
      <p>
        Estes Termos regulam o uso do site da LUPI, operado por {aDefinir(E.razaoSocial)}, CNPJ {aDefinir(E.cnpj)}, com sede em {aDefinir(E.endereco)}. Ao navegar ou
        comprar, você concorda com estes Termos e com a <a href="/privacidade">Política de Privacidade</a>. As compras também são regidas pelo
        Código de Defesa do Consumidor (Lei nº 8.078/1990) e pelo Decreto nº 7.962/2013 (comércio eletrônico).
      </p>

      <h2>1. O que a LUPI faz</h2>
      <p>A LUPI cria, produz e vende roupas e acessórios universitários, incluindo coleções desenvolvidas em parceria com atléticas, centros acadêmicos e outras entidades estudantis.</p>

      <h2>2. Compras sem cadastro</h2>
      <p>Não é preciso criar conta para comprar. Você informa nome, e-mail e telefone no checkout e é responsável pela veracidade desses dados. O pedido só é confirmado após a aprovação do pagamento.</p>

      <h2>3. Preços, descontos e pagamento</h2>
      <ul>
        <li>Preços em reais (R$), com impostos inclusos. Descontos valem enquanto exibidos no site ou até o fim do estoque promocional.</li>
        <li>O valor cobrado é sempre o recalculado no momento da finalização do pedido.</li>
        <li>Pagamentos (Pix, cartão e boleto) são processados pelo Mercado Pago, sujeitos às regras e análises de segurança dele.</li>
        <li>Em caso de erro evidente de preço ou cadastro, podemos cancelar o pedido com reembolso integral.</li>
      </ul>

      <h2>4. Pré-venda e coleções de entidades</h2>
      <p>Algumas peças podem ser vendidas em pré-venda, com produção iniciada após o fechamento da campanha. Nesses casos, o prazo de produção e entrega é informado na página do produto. Se a campanha não atingir o lote mínimo, o pedido é cancelado e o valor devolvido integralmente.</p>

      <h2>5. Entrega</h2>
      <p>O prazo e o valor do frete são informados antes do pagamento. O prazo começa a contar após a confirmação do pagamento (ou após o fechamento da pré-venda, quando for o caso).</p>

      <h2>6. Direito de arrependimento, trocas e defeitos</h2>
      <p>Você pode desistir da compra em até 7 dias corridos do recebimento (art. 49 do CDC), com reembolso integral, inclusive do frete. Para desistir, use o <Canal email={E.email} assunto="Arrependimento ou cancelamento" />; confirmamos o recebimento do pedido de desistência imediatamente. Trocas e defeitos seguem a nossa <a href="/trocas">Política de Trocas e Devoluções</a>.</p>

      <h2>7. Propriedade intelectual</h2>
      <p>Marcas, logotipos, artes, fotos e textos do site pertencem à LUPI ou às entidades parceiras e não podem ser reproduzidos sem autorização. Nomes e símbolos de universidades e atléticas são usados conforme acordos com as respectivas entidades.</p>

      <h2>8. Uso adequado</h2>
      <p>É proibido usar o site para fraude, enviar conteúdo ilegal pelos formulários ou tentar acessar áreas restritas. Podemos cancelar pedidos suspeitos de fraude.</p>

      <h2>9. Responsabilidade</h2>
      <p>As cores das peças podem variar levemente conforme a tela do dispositivo. Nos esforçamos para manter o site disponível, mas podem ocorrer interrupções para manutenção.</p>

      <h2>10. Contato e foro</h2>
      <p>Atendimento: <Canal email={E.email} />. Respondemos em até 5 dias (Decreto nº 7.962/2013, art. 4º). Fica eleito o foro do domicílio do consumidor para resolver eventuais conflitos.</p>
    </LegalPage>
  );
}
