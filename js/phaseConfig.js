/**
 * phaseConfig.js
 * ------------------------------------------------------------------------
 * Configuração de dados de cada fase/ilha — é este arquivo que muda entre
 * as ilhas, NUNCA o gameEngine ou as cenas de gameplay/recompensa (ver
 * ESPECIFICAÇÃO_TECNICA.md, seção 5: "Modelo de Dados das Fases").
 *
 * A partir do Módulo 8, as 4 ilhas do GDD estão completas aqui, todas com
 * exatamente a mesma estrutura de campos. É isso que permite que
 * phasePlay.js e phaseReward.js sejam reaproveitados sem nenhuma alteração
 * para qualquer uma das 4 fases — só o "dado" muda, nunca o "motor" ou a
 * "cena".
 *
 * Campos de cada fase:
 *   id                 - chave desta configuração (bate com a própria chave do objeto)
 *   displayName        - nome exibido da ilha
 *   themePhrase        - frase-tema exibida durante o gameplay (origem: painel/GDD)
 *   durationSeconds    - duração da fase, dentro da faixa 20–30s travada no GDD
 *   collectibleLabel   - nome do item coletável desta ilha, exibido no HUD
 *   starLabel          - nome da estrela conquistada, exibido na recompensa
 *   newPower           - { title, description } do poder revelado na recompensa
 *   theme              - caminhos dos assets visuais desta ilha (Módulo 7)
 *   nextSceneId        - cena para onde ir quando o tempo de jogo acaba (slot "_reward")
 *   nextPhaseSceneId   - cena para onde ir ao avançar na tela de recompensa (slot "_play" da próxima ilha, ou o clímax final)
 *   nextPhaseId        - chave de phaseConfigs da PRÓXIMA ilha, repassada como
 *                        payload para que o próximo slot "_play" saiba qual
 *                        configuração carregar (omitido na última fase)
 * ------------------------------------------------------------------------
 */

export const phaseConfigs = {
  phase_1_coragem: {
    id: "phase_1_coragem",
    displayName: "Ilha da Coragem",
    themePhrase: "Coragem não é não ter medo. É continuar, mesmo com medo, de um jeito novo.",
    durationSeconds: 25,

    collectibleLabel: "Pegadas",
    starLabel: "Estrela da Coragem",
    newPower: {
      title: "Armadura da Coragem",
      description:
        "Suas botas agora lhe dão impulso e estabilidade para ir mais longe!",
    },

    theme: {
      backgroundImage: "assets/phase-1-coragem/background.png",
      groundImage: "assets/phase-1-coragem/ground-tile.png",
      characterSprite: "assets/phase-1-coragem/character.png",
      obstacleImage: "assets/phase-1-coragem/obstacle.png",
      collectibleImage: "assets/phase-1-coragem/collectible.png",
      // Calibrado para o tronco caído (mais largo que alto) — ver Módulo 7.
      obstacleWidthPx: 84,
      obstacleHeightPx: 23,
    },

    nextSceneId: "phase_1_reward",
    nextPhaseSceneId: "phase_2_play",
    nextPhaseId: "phase_2_sabedoria",
  },

  phase_2_sabedoria: {
    id: "phase_2_sabedoria",
    displayName: "Ilha da Sabedoria",
    themePhrase: "A sabedoria abre caminhos que os olhos ainda não veem.",
    durationSeconds: 25,

    collectibleLabel: "Penas de Coruja",
    starLabel: "Estrela da Sabedoria",
    newPower: {
      title: "Conexões de Luz",
      description:
        "Sua mente fica mais rápida e criativa — agora você enxerga soluções onde ninguém vê.",
    },

    theme: {
      backgroundImage: "assets/phase-2-sabedoria/background.png",
      groundImage: "assets/phase-2-sabedoria/ground-tile.png",
      characterSprite: "assets/phase-2-sabedoria/character.png",
      obstacleImage: "assets/phase-2-sabedoria/obstacle.png",
      collectibleImage: "assets/phase-2-sabedoria/collectible.png",
      // Calibrado para a pilha de livros (proporção 1.46) — Módulo 8.
      obstacleWidthPx: 68,
      obstacleHeightPx: 47,
    },

    nextSceneId: "phase_2_reward",
    nextPhaseSceneId: "phase_3_play",
    nextPhaseId: "phase_3_alegria",
  },

  phase_3_alegria: {
    id: "phase_3_alegria",
    displayName: "Ilha da Alegria",
    themePhrase: "A alegria transforma o difícil em leveza e inspira o mundo.",
    durationSeconds: 25,

    collectibleLabel: "Conchas de Luz",
    starLabel: "Estrela da Alegria",
    newPower: {
      title: "Asas da Liberdade",
      description:
        "Agora você pode voar, alcançar novos lugares e ajudar de onde estiver.",
    },

    theme: {
      backgroundImage: "assets/phase-3-alegria/background.png",
      groundImage: "assets/phase-3-alegria/ground-tile.png",
      characterSprite: "assets/phase-3-alegria/character.png",
      obstacleImage: "assets/phase-3-alegria/obstacle.png",
      collectibleImage: "assets/phase-3-alegria/collectible.png",
      // Calibrado para o monte de conchas/espuma (proporção 2.69) — Módulo 8.
      obstacleWidthPx: 74,
      obstacleHeightPx: 28,
    },

    nextSceneId: "phase_3_reward",
    nextPhaseSceneId: "phase_4_play",
    nextPhaseId: "phase_4_amor",
  },

  phase_4_amor: {
    id: "phase_4_amor",
    displayName: "Ilha do Amor",
    themePhrase: "O amor te dá força para ser luz na vida das pessoas.",
    durationSeconds: 25,

    collectibleLabel: "Corações de Luz",
    starLabel: "Estrela do Amor",
    newPower: {
      title: "Escudo da Empatia",
      description:
        "Seu coração se torna um escudo que protege e acolhe todos ao seu redor.",
    },

    theme: {
      backgroundImage: "assets/phase-4-amor/background.png",
      groundImage: "assets/phase-4-amor/ground-tile.png",
      characterSprite: "assets/phase-4-amor/character.png",
      obstacleImage: "assets/phase-4-amor/obstacle.png",
      collectibleImage: "assets/phase-4-amor/collectible.png",
      // Calibrado para o arbusto de rosas (proporção 2.90) — Módulo 8.
      obstacleWidthPx: 78,
      obstacleHeightPx: 26,
    },

    nextSceneId: "phase_4_reward",
    // Última ilha: a recompensa leva ao clímax final (Módulo 9), não a
    // outra fase jogável — por isso não há nextPhaseId aqui (não existe
    // "próxima ilha" para repassar via payload).
    nextPhaseSceneId: "final_transformation",
  },
};
