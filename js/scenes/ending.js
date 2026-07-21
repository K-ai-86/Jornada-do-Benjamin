/**
 * scenes/ending.js
 * ------------------------------------------------------------------------
 * Tela de Encerramento — última tela do jogo.
 *
 * Exibe o agradecimento aos convidados e o CTA de WhatsApp, que agora
 * (Módulo 10) é um link real para a API do WhatsApp
 * (https://wa.me/<numero>?text=<mensagem>), com a mensagem de
 * felicitações pré-preenchida e corretamente codificada via
 * encodeURIComponent — os dados em si (número e texto) vivem em
 * finalConfig.js, nunca hardcoded aqui.
 *
 * Não há transição para nenhuma cena seguinte: esta é a última tela do
 * fluxo linear do jogo (ver GAME_DESIGN_DOCUMENT.md, seção 6).
 * ------------------------------------------------------------------------
 */

import { finalConfig } from "../finalConfig.js";

/**
 * Monta a URL da API do WhatsApp a partir do número e da mensagem
 * configurados, garantindo que caracteres especiais/acentos da mensagem
 * sejam corretamente codificados para uma URL.
 */
function buildWhatsappUrl(phoneNumber, message) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export const endingScene = {
  render(root) {
    const whatsappUrl = buildWhatsappUrl(finalConfig.whatsappPhoneNumber, finalConfig.whatsappMessage);

    root.innerHTML = `
      <section class="ending-screen" aria-labelledby="ending-screen-heading">
        <div class="sun-badge" aria-hidden="true"></div>

        <h2 class="ending-screen__heading" id="ending-screen-heading">
          ${finalConfig.endingThankYouTitle}
        </h2>

        <p class="ending-screen__message">
          ${finalConfig.endingThankYouMessage}
        </p>

        <a
          href="${whatsappUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary"
          id="btn-whatsapp-cta"
        >
          ${finalConfig.whatsappButtonLabel}
        </a>
      </section>
    `;
  },
};
