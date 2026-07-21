/**
 * scenes/finalTransformation.js
 * ------------------------------------------------------------------------
 * Clímax narrativo: as 4 estrelas se unem e Benjamin se transforma no
 * Leão Solar. Exibida uma única vez, depois que a Fase 4 (Ilha do Amor)
 * é concluída e sua recompensa avançada.
 *
 * Mantém o mesmo padrão dos módulos anteriores: nenhuma lógica de jogo
 * aqui, apenas apresentação — e a arte final (finalConfig.leaoSolarImage)
 * segue o mesmo padrão de fallback visual neutro do Módulo 7, para a
 * cena continuar testável antes do recorte definitivo existir.
 *
 * Ao continuar, leva para a Tela de Encerramento ("ending").
 * ------------------------------------------------------------------------
 */

import { finalConfig } from "../finalConfig.js";

export const finalTransformationScene = {
  render(root, { goTo }) {
    const identityMessageHtml = finalConfig.identityMessageLines
      .map((line) => `<p>${line}</p>`)
      .join("");

    root.innerHTML = `
      <section class="final-transformation" aria-labelledby="final-transformation-heading">
        <div class="final-transformation__stars" aria-hidden="true">
          <span class="sun-badge final-transformation__star"></span>
          <span class="sun-badge final-transformation__star"></span>
          <span class="sun-badge final-transformation__star"></span>
          <span class="sun-badge final-transformation__star"></span>
        </div>

        <div
          class="final-transformation__portrait"
          style="background-image: url('${finalConfig.leaoSolarImage}');"
          role="img"
          aria-label="Benjamin transformado no Leão Solar"
        ></div>

        <div class="final-transformation__message" id="final-transformation-heading">
          ${identityMessageHtml}
        </div>

        <button type="button" class="btn-primary" id="btn-continue-to-ending">
          Continuar
        </button>
      </section>
    `;

    const continueButton = root.querySelector("#btn-continue-to-ending");

    function handleContinueClick() {
      goTo("ending");
    }

    continueButton.addEventListener("click", handleContinueClick);

    return () => {
      continueButton.removeEventListener("click", handleContinueClick);
    };
  },
};
