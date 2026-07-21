/**
 * scenes/phaseReward.js
 * ------------------------------------------------------------------------
 * Tela de Recompensa de Fase — exibida ao final de cada ilha jogável.
 *
 * Lê, via payload repassado pelo sceneManager, qual fase acabou de ser
 * concluída (phaseId) e quantos itens foram coletados nela (itemsCollected),
 * e busca em phaseConfig.js os dados de recompensa dessa fase: a estrela
 * conquistada, o novo poder revelado, e o rótulo de coleta.
 *
 * Reaproveita o componente `.sun-badge`, criado no Módulo 2 para a Tela de
 * Introdução, mantendo a mesma identidade visual sem duplicar estilo.
 *
 * Ao avançar, usa `config.nextPhaseSceneId` — nunca decide sozinha para
 * onde ir, mantendo esse dado centralizado em phaseConfig.js.
 * ------------------------------------------------------------------------
 */

import { phaseConfigs } from "../phaseConfig.js";

export const phaseRewardScene = {
  render(root, { goTo }, payload) {
    const phaseId = (payload && payload.phaseId) || "phase_1_coragem";
    const itemsCollected = (payload && payload.itemsCollected) || 0;
    const config = phaseConfigs[phaseId];

    if (!config) {
      console.error(`[phaseReward] Configuração não encontrada para a fase "${phaseId}".`);
      return;
    }

    root.innerHTML = `
      <section class="phase-reward" aria-labelledby="phase-reward-heading">
        <div
          class="phase-reward__icon"
          style="background-image: url('${config.theme.collectibleImage}');"
          role="img"
          aria-label="${config.collectibleLabel}"
        ></div>

        <p class="phase-reward__eyebrow">${config.displayName} concluída!</p>

        <h2 class="phase-reward__heading" id="phase-reward-heading">
          ${config.starLabel}
        </h2>

        <div class="phase-reward__power">
          <p class="phase-reward__power-label">Novo Poder</p>
          <p class="phase-reward__power-title">${config.newPower.title}</p>
          <p class="phase-reward__power-description">${config.newPower.description}</p>
        </div>

        <p class="phase-reward__collection">
          ${config.collectibleLabel} coletadas: ${itemsCollected}
        </p>

        <button type="button" class="btn-primary" id="btn-advance-journey">
          Avançar Jornada
        </button>
      </section>
    `;

    const advanceButton = root.querySelector("#btn-advance-journey");

    function handleAdvanceClick() {
      // Repassa explicitamente qual configuração a próxima cena de
      // gameplay deve carregar (config.nextPhaseId). Sem isso, o slot
      // genérico "phase_N_play" não saberia se deve carregar a Ilha da
      // Sabedoria, da Alegria, do Amor — ou, por engano, a Coragem de
      // novo (valor padrão de phasePlay.js quando nenhum payload chega).
      const nextPayload = config.nextPhaseId ? { phaseId: config.nextPhaseId } : undefined;
      goTo(config.nextPhaseSceneId, nextPayload);
    }

    advanceButton.addEventListener("click", handleAdvanceClick);

    return () => {
      advanceButton.removeEventListener("click", handleAdvanceClick);
    };
  },
};
