/**
 * main.js
 * ------------------------------------------------------------------------
 * A Jornada de Benjamin: O Leão Solar
 *
 * Ponto único de entrada do jogo. Responsabilidade única e permanente:
 * inicializar o sceneManager, registrar as cenas disponíveis, e disparar
 * a primeira tela.
 *
 * A partir do Módulo 8, phasePlayScene e phaseRewardScene são registradas
 * uma única vez cada e reaproveitadas para as 4 ilhas — o slot de cena
 * ("phase_2_play", "phase_3_reward", etc.) só decide QUANDO essa cena
 * aparece no fluxo; QUAL fase ela carrega vem inteiramente do payload
 * (phaseId), repassado entre phasePlay.js e phaseReward.js. Isso é o que
 * elimina a necessidade de um arquivo de cena por ilha.
 *
 * Nenhuma lógica de tela ou de jogo deve viver aqui — isso pertence a
 * cada arquivo em js/scenes/ (telas) ou a js/gameEngine.js (jogo).
 * ------------------------------------------------------------------------
 */

import { createSceneManager } from "./sceneManager.js";
import { titleScene } from "./scenes/title.js";
import { introScene } from "./scenes/intro.js";
import { phasePlayScene } from "./scenes/phasePlay.js";
import { phaseRewardScene } from "./scenes/phaseReward.js";
import { finalTransformationScene } from "./scenes/finalTransformation.js";
import { endingScene } from "./scenes/ending.js";

function init() {
  const appRoot = document.getElementById("app");

  if (!appRoot) {
    console.error("[Benjamin] Elemento #app não encontrado no index.html.");
    return;
  }

  const sceneManager = createSceneManager(appRoot);

  sceneManager.register("title", titleScene);
  sceneManager.register("intro", introScene);

  // As 4 ilhas reaproveitam as mesmas duas cenas genéricas — só o dado
  // (phaseConfig.js) muda entre elas.
  sceneManager.register("phase_1_play", phasePlayScene);
  sceneManager.register("phase_1_reward", phaseRewardScene);
  sceneManager.register("phase_2_play", phasePlayScene);
  sceneManager.register("phase_2_reward", phaseRewardScene);
  sceneManager.register("phase_3_play", phasePlayScene);
  sceneManager.register("phase_3_reward", phaseRewardScene);
  sceneManager.register("phase_4_play", phasePlayScene);
  sceneManager.register("phase_4_reward", phaseRewardScene);

  sceneManager.register("final_transformation", finalTransformationScene);
  sceneManager.register("ending", endingScene);

  sceneManager.goTo("title");
}

init();
