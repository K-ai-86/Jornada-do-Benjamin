/**
 * scenes/phasePlay.js
 * ------------------------------------------------------------------------
 * Cena de gameplay genérica.
 *
 * Responsabilidade: ler a configuração da fase atual em phaseConfig.js,
 * iniciar o gameEngine, e traduzir os números que o motor calcula (scroll,
 * tempo, física do pulo, obstáculos, tropeço, itens coletados) em
 * atualizações visuais.
 *
 * Desde o Módulo 5, esta cena também mantém um HUD fixo no topo com o
 * progresso de coleta ("Pegadas: N") e renderiza os itens colecionáveis
 * (no chão ou flutuando), com um efeito visual de saída quando um item
 * some da lista ativa do motor (coletado ou fora da tela) — a cena decide
 * como animar isso, o motor só informa "este item não está mais ativo".
 *
 * A partir do Módulo 7, cenário, chão, personagem, obstáculos e itens são
 * renderizados com as imagens reais definidas em phaseConfig.js
 * (config.theme), em vez dos blocos de cor sólida dos módulos anteriores.
 * As dimensões continuam vindo das constantes do gameEngine, garantindo
 * que a arte nunca fique dessincronizada da caixa de colisão real.
 *
 * O toque na tela continua servindo exclusivamente para pular — a coleta
 * de itens é sempre automática, por sobreposição, sem nenhuma ação do
 * jogador além de se posicionar (correndo ou pulando) sobre o item.
 * ------------------------------------------------------------------------
 */

import { phaseConfigs } from "../phaseConfig.js";
import {
  createGameEngine,
  CHARACTER_LEFT_PX,
  CHARACTER_WIDTH_PX,
  CHARACTER_HEIGHT_PX,
  OBSTACLE_WIDTH_PX as DEFAULT_OBSTACLE_WIDTH_PX,
  OBSTACLE_HEIGHT_PX as DEFAULT_OBSTACLE_HEIGHT_PX,
  ITEM_SIZE_PX,
} from "../gameEngine.js";

// Largura, em pixels, do padrão repetido do chão (deve bater com o
// `background-size` de `.phase-play__ground` no style.css).
const GROUND_PATTERN_WIDTH_PX = 200;

// Duração da transição de saída de um item coletado/removido, em ms —
// puramente visual; o motor não sabe nada sobre isso.
const ITEM_EXIT_TRANSITION_MS = 260;

export const phasePlayScene = {
  render(root, { goTo }, payload) {
    const phaseId = (payload && payload.phaseId) || "phase_1_coragem";
    const config = phaseConfigs[phaseId];

    if (!config) {
      console.error(`[phasePlay] Configuração não encontrada para a fase "${phaseId}".`);
      return;
    }

    root.innerHTML = `
      <section
        class="phase-play"
        style="background-image: url('${config.theme.backgroundImage}');"
        aria-label="${config.displayName} — em jogo. Toque na tela para pular."
      >
        <p class="phase-play__hud" id="phase-play-hud" aria-live="polite">
          ${config.collectibleLabel}: 0
        </p>

        <p class="phase-play__theme-phrase">${config.themePhrase}</p>

        <p class="phase-play__timer" id="phase-play-timer" aria-live="polite">
          ${Math.ceil(config.durationSeconds)}s
        </p>

        <div class="phase-play__stage" id="phase-play-stage">
          <div
            class="phase-play__ground"
            id="phase-play-ground"
            style="background-image: url('${config.theme.groundImage}');"
          ></div>
          <div
            class="phase-play__character"
            id="phase-play-character"
            style="
              background-image: url('${config.theme.characterSprite}');
              left: ${CHARACTER_LEFT_PX}px;
              width: ${CHARACTER_WIDTH_PX}px;
              height: ${CHARACTER_HEIGHT_PX}px;
            "
            aria-hidden="true"
          ></div>

          <p class="phase-play__instruction" id="phase-play-instruction">
            👆 Toque na tela para pular!
          </p>
        </div>
      </section>
    `;

    const hud = root.querySelector("#phase-play-hud");
    const timerLabel = root.querySelector("#phase-play-timer");
    const ground = root.querySelector("#phase-play-ground");
    const stage = root.querySelector("#phase-play-stage");
    const character = root.querySelector("#phase-play-character");
    const instruction = root.querySelector("#phase-play-instruction");

    // Elementos de obstáculo e item são criados/removidos dinamicamente
    // conforme o motor os spawna e os descarta — cada Map guarda a
    // referência de um <div> pelo id, para reaproveitar o mesmo elemento
    // entre quadros (sem recriar DOM a cada frame).
    const obstacleElementsById = new Map();
    const itemElementsById = new Map();

    const obstacleWidthPx = config.theme.obstacleWidthPx ?? DEFAULT_OBSTACLE_WIDTH_PX;
    const obstacleHeightPx = config.theme.obstacleHeightPx ?? DEFAULT_OBSTACLE_HEIGHT_PX;

    function syncObstacleElements(obstacles) {
      const activeIds = new Set();

      for (const obstacle of obstacles) {
        activeIds.add(obstacle.id);

        let element = obstacleElementsById.get(obstacle.id);
        if (!element) {
          element = document.createElement("div");
          element.className = "phase-play__obstacle";
          element.style.width = `${obstacleWidthPx}px`;
          element.style.height = `${obstacleHeightPx}px`;
          element.style.backgroundImage = `url('${config.theme.obstacleImage}')`;
          stage.appendChild(element);
          obstacleElementsById.set(obstacle.id, element);
        }

        element.style.transform = `translateX(${obstacle.xPx}px)`;
      }

      for (const [id, element] of obstacleElementsById) {
        if (!activeIds.has(id)) {
          element.remove();
          obstacleElementsById.delete(id);
        }
      }
    }

    function syncItemElements(items) {
      const activeIds = new Set();

      for (const item of items) {
        activeIds.add(item.id);

        let element = itemElementsById.get(item.id);
        if (!element) {
          element = document.createElement("div");
          element.className = "phase-play__item";
          element.style.width = `${ITEM_SIZE_PX}px`;
          element.style.height = `${ITEM_SIZE_PX}px`;
          element.style.backgroundImage = `url('${config.theme.collectibleImage}')`;
          // heightPx eleva o item acima da linha do chão (itens flutuantes).
          element.style.bottom = `calc(22% + ${item.heightPx}px)`;
          stage.appendChild(element);
          itemElementsById.set(item.id, element);
        }

        element.style.transform = `translateX(${item.xPx}px)`;
      }

      // O motor não distingue "coletado" de "saiu da tela" nesta lista —
      // em ambos os casos o item some da lista ativa, e é papel da cena
      // dar a saída visual (leve "pop" de escala + fade), sem qualquer
      // custo perceptível para itens que apenas saíram de tela (já
      // invisíveis de qualquer forma).
      for (const [id, element] of itemElementsById) {
        if (!activeIds.has(id)) {
          itemElementsById.delete(id);
          const lastTransform = element.style.transform;
          element.style.transition = `transform ${ITEM_EXIT_TRANSITION_MS}ms ease, opacity ${ITEM_EXIT_TRANSITION_MS}ms ease`;
          element.style.transform = `${lastTransform} scale(1.7) translateY(-14px)`;
          element.style.opacity = "0";
          window.setTimeout(() => element.remove(), ITEM_EXIT_TRANSITION_MS);
        }
      }
    }

    function applyCharacterState({ jumpOffsetPx, isInvincible }) {
      character.style.transform = `translateY(${-jumpOffsetPx}px)`;
      character.classList.toggle("phase-play__character--stumbling", isInvincible);
    }

    let totalItemsCollected = 0;


  function updateHud(totalCollected, collectionX, collectionHeight) {
    totalItemsCollected = totalCollected;
    hud.textContent = `${config.collectibleLabel}: ${totalCollected}`;

    // Cria o elemento visual "+1" flutuante
    if (typeof collectionX !== "undefined") {
      const floatText = document.createElement("div");
      floatText.className = "floating-score";
      floatText.textContent = "+1";
      
      // Posiciona na horizontal onde o item estava e na vertical acima do chão
      floatText.style.left = `${collectionX}px`;
      floatText.style.bottom = `calc(22% + ${collectionHeight || 50}px)`;
      
      stage.appendChild(floatText);

      // Remove o elemento do DOM assim que a animação termina (600ms)
      window.setTimeout(() => {
        floatText.remove();
      }, 600);
    }
  }

    const engine = createGameEngine({
      durationSeconds: config.durationSeconds,
      stageWidthPx: stage.clientWidth,
      obstacleWidthPx,
      obstacleHeightPx,

      onScrollUpdate(scrollOffsetPx) {
        // Efeito de esteira infinita: usa o resto da divisão para que o
        // padrão do chão pareça contínuo, sem precisar de vários elementos.
        const loopedOffsetPx = scrollOffsetPx % GROUND_PATTERN_WIDTH_PX;
        ground.style.backgroundPositionX = `-${loopedOffsetPx}px`;
      },

      onTimeUpdate(remainingSeconds) {
        timerLabel.textContent = `${Math.ceil(remainingSeconds)}s`;
      },

      onCharacterUpdate: applyCharacterState,
      onObstaclesUpdate: syncObstacleElements,
      onItemsUpdate: syncItemElements,
     onItemCollected(totalCollected, lastCollectedItem) {
      console.log("onItemCollected chamado na cena", totalCollected, lastCollectedItem);
      // Passa o total e a posição X e altura do item que acabou de ser pego
      const itemX = lastCollectedItem ? lastCollectedItem.xPx : undefined;
      const itemHeight = lastCollectedItem ? lastCollectedItem.heightPx : undefined;
      console.log("valores calculados:", itemX, itemHeight);
      updateHud(totalCollected, itemX, itemHeight);
    },
      onComplete() {
        goTo(config.nextSceneId, { phaseId, itemsCollected: totalItemsCollected });
      },
    });

    engine.start();

    // Instrução "toque para pular": some sozinha depois de alguns
    // segundos, ou imediatamente se o jogador já tocar antes disso —
    // o que acontecer primeiro. Aparece do zero em toda fase nova (é
    // reconstruída junto com o HTML desta cena a cada ilha).
    const INSTRUCTION_AUTO_HIDE_MS = 3200;
    let instructionHidden = false;
    function hideInstruction() {
      if (instructionHidden) return;
      instructionHidden = true;
      instruction.classList.add("phase-play__instruction--hidden");
    }
    const instructionTimeoutId = window.setTimeout(hideInstruction, INSTRUCTION_AUTO_HIDE_MS);

    // Toque em qualquer ponto da tela = pular. Nenhum outro gesto é
    // necessário: a coleta de itens é sempre automática (ver gameEngine).
    function handlePointerDown() {
      engine.jump();
      hideInstruction();
    }
    root.addEventListener("pointerdown", handlePointerDown);

    // Limpeza ao sair da cena: para o motor, remove o listener de toque e
    // cancela o timeout da instrução, se ainda pendente.
    return () => {
      engine.stop();
      root.removeEventListener("pointerdown", handlePointerDown);
      window.clearTimeout(instructionTimeoutId);
    };
  },
};
