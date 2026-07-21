/**
 * sceneManager.js
 * ------------------------------------------------------------------------
 * Máquina de estados linear e genérica para as telas do jogo.
 *
 * Este módulo NÃO sabe nada sobre o conteúdo de nenhuma tela específica
 * (título, introdução, fases, encerramento). Ele apenas:
 *   1) guarda um registro de cenas (nome → módulo da cena),
 *   2) troca a cena atual por outra quando solicitado (`goTo`),
 *   3) garante que a cena anterior seja "limpa" antes da próxima montar.
 *
 * Isso é o que permite que, do Módulo 2 em diante, cada nova tela (fases,
 * telas de recompensa, encerramento) seja apenas mais um arquivo de cena
 * registrado aqui — sem nunca precisar alterar este arquivo.
 *
 * Contrato de uma "cena" (ver js/scenes/*.js para exemplos):
 *   {
 *     render(rootElement, api, payload) {
 *       // monta o conteúdo da tela dentro de rootElement
 *       // pode, opcionalmente, retornar uma função de limpeza (cleanup),
 *       // chamada automaticamente antes da próxima transição.
 *     }
 *   }
 * ------------------------------------------------------------------------
 */

export function createSceneManager(rootElement) {
  const registeredScenes = new Map();
  let cleanupCurrentScene = null;
  let currentSceneName = null;

  /**
   * Registra uma cena sob um nome único (ex: "title", "intro").
   * @param {string} name
   * @param {{ render: Function }} sceneModule
   */
  function register(name, sceneModule) {
    if (registeredScenes.has(name)) {
      console.warn(`[SceneManager] A cena "${name}" já estava registrada e foi sobrescrita.`);
    }
    registeredScenes.set(name, sceneModule);
  }

  /**
   * Troca para a cena solicitada, limpando a anterior primeiro.
   * @param {string} name - nome da cena registrada
   * @param {*} [payload] - dado opcional repassado à cena (ex: dados da fase)
   */
  function goTo(name, payload) {
    const scene = registeredScenes.get(name);

    if (!scene) {
      const disponiveis = [...registeredScenes.keys()].join(", ") || "(nenhuma)";
      console.error(`[SceneManager] Cena "${name}" não encontrada. Cenas registradas: ${disponiveis}`);
      return;
    }

    if (typeof cleanupCurrentScene === "function") {
      cleanupCurrentScene();
    }
    cleanupCurrentScene = null;

    rootElement.innerHTML = "";
    currentSceneName = name;

    const sceneApi = { goTo };
    const maybeCleanup = scene.render(rootElement, sceneApi, payload);

    if (typeof maybeCleanup === "function") {
      cleanupCurrentScene = maybeCleanup;
    }
  }

  function getCurrentSceneName() {
    return currentSceneName;
  }

  return { register, goTo, getCurrentSceneName };
}
