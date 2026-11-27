/**
 * Política de trocas e devoluções (arrependimento em 7 dias, troca em 30 dias, defeito em 90
 * dias).
 */
import type { Metadata } from "next";
import { LegalPage, Canal } from "@/components/legal";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = { title: "Trocas e Devoluções — LUPi." };

export default function Trocas() {
  return (
    <LegalPage title="Trocas e Devoluções" current="/trocas">
      <h2>Arrependimento — 7 dias</h2>
      <p>Comprou e não quer mais? Você tem até <strong>7 dias corridos após o recebimento</strong> para desistir, sem precisar justificar (art. 49 do CDC). Devolvemos 100% do valor pago, incluindo o frete, pelo mesmo meio de pagamento.</p>

      <h2>Troca de tamanho — 30 dias</h2>
      <p>A primeira troca de tamanho é <strong>grátis em até 30 dias</strong> após o recebimento, sujeita à disponibilidade em estoque. A peça deve estar sem uso, sem lavagem e com etiqueta.</p>

      <h2>Produto com defeito — 90 dias</h2>
      <p>Peças com defeito de fabricação podem ser reclamadas em até <strong>90 dias</strong> (art. 26 do CDC). Você escolhe entre troca por peça igual, outra peça de mesmo valor ou reembolso.</p>

      <h2>Peças personalizadas e pré-venda</h2>
      <p>Peças produzidas sob medida com nome ou número do comprador não podem ser trocadas por tamanho, salvo defeito. O direito de arrependimento continua valendo nos termos da lei.</p>

      <h2>Como solicitar</h2>
      <ul>
        <li>Envie o número do pedido pelo <Canal email={EMPRESA.email} assunto="Arrependimento ou cancelamento" />, ou “Troca ou devolução” para trocas.</li>
        <li>Enviamos as instruções e o código de postagem.</li>
        <li>O reembolso é feito em até 10 dias úteis após recebermos a peça. No cartão, pode aparecer em até duas faturas.</li>
      </ul>
    </LegalPage>
  );
}
