/**
 * gameEngine.js
 * ------------------------------------------------------------------------
 * Motor genérico do "runner" one-touch, controlado por requestAnimationFrame.
 *
 * Responsabilidades deste motor:
 *   1) calcular o deslocamento acumulado do cenário (scroll automático),
 *   2) controlar a contagem regressiva do tempo de fase,
 *   3) simular a física simples do pulo (impulso + gravidade),
 *   4) spawnar e mover obstáculos com base na distância percorrida,
 *   5) detectar colisão (AABB) entre personagem e obstáculos, disparando
 *      um estado de tropeço/invencibilidade — nunca um fail-state,
 *   6) spawnar itens colecionáveis (no chão e flutuando) e detectar sua
 *      coleta automática por sobreposição (Módulo 5).
 *
 * O motor continua sem saber nada sobre arte, fases específicas ou como
 * desenhar qualquer coisa: tudo isso é entregue via callbacks para a cena
 * (phasePlay.js) decidir como representar visualmente.
 * ------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------
// Constantes de física e dimensões do placeholder.
// Exportadas para que a cena (e o CSS, via JS) usem exatamente os mesmos
// valores do motor — evita que a caixa de colisão e o retângulo visual
// fiquem dessincronizados por número mágico duplicado em dois arquivos.
// ---------------------------------------------------------------------
export const CHARACTER_LEFT_PX = 70;
export const CHARACTER_WIDTH_PX = 76;
export const CHARACTER_HEIGHT_PX = 76;

export const OBSTACLE_WIDTH_PX = 84;
export const OBSTACLE_HEIGHT_PX = 24;
export const OBSTACLE_SPAWN_DISTANCE_PX = 420;

export const ITEM_SIZE_PX = 38;
export const ITEM_SPAWN_DISTANCE_PX = 260;
// Altura (acima do chão) de um item "flutuante": alta o suficiente para
// exigir um pulo bem cronometrado, mas dentro do alcance real do pulo
// (recalibrado — ver nova física de pulo logo abaixo).
export const ITEM_FLOATING_HEIGHT_PX = 110;
export const ITEM_GROUND_HEIGHT_PX = 0;

// Distância mínima (em scroll) entre o nascimento de um item e o de um
// obstáculo. Como ambos nascem sempre na borda direita e se movem à
// mesma velocidade, dois spawns próximos no tempo permanecem "grudados"
// visualmente pra sempre — essa margem evita que um item apareça em cima
// de um obstáculo.
const MIN_ITEM_OBSTACLE_SEPARATION_PX = 90;

const JUMP_INITIAL_VELOCITY_PX_PER_SECOND = 720;
const GRAVITY_PX_PER_SECOND_SQUARED = 1400;
const STUMBLE_INVINCIBILITY_MS = 1000;

// Identificadores incrementais simples (únicos só dentro da sessão de jogo).
let nextObstacleId = 1;
let nextItemId = 1;

/**
 * @param {Object} options
 * @param {number} options.durationSeconds - duração total da fase
 * @param {number} [options.scrollSpeedPxPerSecond] - velocidade do scroll automático
 * @param {number} [options.stageWidthPx] - largura útil do palco, usada para
 *   saber onde obstáculos/itens nascem (borda direita); se omitida, usa a
 *   largura da janela como aproximação razoável.
 * @param {(scrollOffsetPx: number) => void} [options.onScrollUpdate]
 * @param {(remainingSeconds: number) => void} [options.onTimeUpdate]
 * @param {(state: { jumpOffsetPx: number, isInvincible: boolean }) => void} [options.onCharacterUpdate]
 * @param {(obstacles: Array<{ id: number, xPx: number }>) => void} [options.onObstaclesUpdate]
 * @param {(items: Array<{ id: number, xPx: number, heightPx: number }>) => void} [options.onItemsUpdate]
 * @param {(totalCollected: number) => void} [options.onItemCollected] - chamado a cada coleta, com o total acumulado
 * @param {() => void} [options.onStumble] - chamado a cada tropeço (colisão)
 * @param {() => void} [options.onComplete] - chamado uma única vez, quando o tempo acaba
 */
export function createGameEngine({
  durationSeconds,
  scrollSpeedPxPerSecond = 110,
  stageWidthPx = typeof window !== "undefined" ? window.innerWidth : 400,
  obstacleWidthPx = OBSTACLE_WIDTH_PX,
  obstacleHeightPx = OBSTACLE_HEIGHT_PX,
  onScrollUpdate,
  onTimeUpdate,
  onCharacterUpdate,
  onObstaclesUpdate,
  onItemsUpdate,
  onItemCollected,
  onStumble,
  onComplete,
}) {
  let animationFrameId = null;
  let startTimestampMs = null;
  let lastTimestampMs = null;
  let hasCompleted = false;

  // ---- Estado do pulo (física simples: impulso + gravidade) ----
  let jumpOffsetPx = 0; // 0 = personagem no chão
  let jumpVelocityPxPerSecond = 0;
  let isJumping = false;

  // ---- Estado de tropeço / invencibilidade temporária ----
  let isInvincible = false;
  let invincibleUntilMs = 0;

  // ---- Obstáculos ativos nesta sessão de jogo ----
  let obstacles = [];
  let lastObstacleSpawnIndex = -1;
  let lastObstacleSpawnScrollOffsetPx = -Infinity;

  // ---- Itens colecionáveis ativos nesta sessão de jogo ----
  let items = [];
  let lastItemSpawnIndex = -1;
  let lastItemSpawnScrollOffsetPx = -Infinity;
  let collectedItemsCount = 0;

  function tick(timestampMs) {
    if (startTimestampMs === null) {
      startTimestampMs = timestampMs;
      lastTimestampMs = timestampMs;
    }

    const deltaSeconds = (timestampMs - lastTimestampMs) / 1000;
    lastTimestampMs = timestampMs;

    const elapsedSeconds = (timestampMs - startTimestampMs) / 1000;
    const remainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0);
    const scrollOffsetPx = elapsedSeconds * scrollSpeedPxPerSecond;

    updateJumpPhysics(deltaSeconds);
    updateInvincibility(timestampMs);

    spawnObstaclesIfNeeded(scrollOffsetPx);
    updateObstaclePositions(scrollOffsetPx);
    checkObstacleCollisions();

    spawnItemsIfNeeded(scrollOffsetPx);
    updateItemPositions(scrollOffsetPx);
    checkItemCollection();

    if (typeof onScrollUpdate === "function") {
      onScrollUpdate(scrollOffsetPx);
    }
    if (typeof onTimeUpdate === "function") {
      onTimeUpdate(remainingSeconds);
    }
    if (typeof onCharacterUpdate === "function") {
      onCharacterUpdate({ jumpOffsetPx, isInvincible });
    }
    if (typeof onObstaclesUpdate === "function") {
      onObstaclesUpdate(obstacles.map((obstacle) => ({ id: obstacle.id, xPx: obstacle.xPx })));
    }
    if (typeof onItemsUpdate === "function") {
      onItemsUpdate(items.map((item) => ({ id: item.id, xPx: item.xPx, heightPx: item.heightPx })));
    }

    if (remainingSeconds <= 0) {
      complete();
      return;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  /** Aplica impulso e gravidade ao deslocamento vertical do personagem. */
  function updateJumpPhysics(deltaSeconds) {
    if (!isJumping) return;

    jumpVelocityPxPerSecond -= GRAVITY_PX_PER_SECOND_SQUARED * deltaSeconds;
    jumpOffsetPx += jumpVelocityPxPerSecond * deltaSeconds;

    // Pouso automático: só considera "aterrissado" quando o personagem já
    // está na altura do chão E descendo (velocidade não-positiva). Sem a
    // checagem de velocidade, o primeiro quadro de um pulo — que sempre
    // tem deltaSeconds ≈ 0, logo jumpOffsetPx ainda em 0 — seria
    // erroneamente interpretado como pouso antes do pulo sequer começar.
    if (jumpOffsetPx <= 0 && jumpVelocityPxPerSecond <= 0) {
      jumpOffsetPx = 0;
      jumpVelocityPxPerSecond = 0;
      isJumping = false;
    }
  }

  function updateInvincibility(timestampMs) {
    if (isInvincible && timestampMs >= invincibleUntilMs) {
      isInvincible = false;
    }
  }

  /** Spawna novos obstáculos conforme a distância de scroll percorrida. */
  function spawnObstaclesIfNeeded(scrollOffsetPx) {
    const spawnIndex = Math.floor(scrollOffsetPx / OBSTACLE_SPAWN_DISTANCE_PX);
    if (spawnIndex <= lastObstacleSpawnIndex) return;

    for (let i = lastObstacleSpawnIndex + 1; i <= spawnIndex; i++) {
      // Simétrico à checagem em spawnItemsIfNeeded: evita nascer um
      // obstáculo colado a um item que acabou de aparecer.
      const distanceFromLastItem = Math.abs(scrollOffsetPx - lastItemSpawnScrollOffsetPx);
      if (distanceFromLastItem < MIN_ITEM_OBSTACLE_SEPARATION_PX) {
        continue;
      }

      obstacles.push({
        id: nextObstacleId++,
        spawnScrollOffsetPx: scrollOffsetPx,
        spawnXPx: stageWidthPx,
        xPx: stageWidthPx,
        consumed: false,
      });
      lastObstacleSpawnScrollOffsetPx = scrollOffsetPx;
    }
    lastObstacleSpawnIndex = spawnIndex;
  }

  /** Recalcula a posição X de cada obstáculo e remove os que já saíram da tela. */
  function updateObstaclePositions(scrollOffsetPx) {
    for (const obstacle of obstacles) {
      const traveledSinceSpawnPx = scrollOffsetPx - obstacle.spawnScrollOffsetPx;
      obstacle.xPx = obstacle.spawnXPx - traveledSinceSpawnPx;
    }

    obstacles = obstacles.filter((obstacle) => obstacle.xPx + obstacleWidthPx > 0);
  }

  /**
   * Detecção de colisão simples (AABB — Axis-Aligned Bounding Box).
   * Se o personagem pulou alto o suficiente (jumpOffsetPx >= altura do
   * obstáculo), não há sobreposição vertical: o pulo "funciona" de graça,
   * sem precisar de nenhuma regra especial além da própria física.
   */
  function checkObstacleCollisions() {
    if (isInvincible) return;

    const characterLeft = CHARACTER_LEFT_PX;
    const characterRight = CHARACTER_LEFT_PX + CHARACTER_WIDTH_PX;

    for (const obstacle of obstacles) {
      if (obstacle.consumed) continue;

      const obstacleLeft = obstacle.xPx;
      const obstacleRight = obstacle.xPx + obstacleWidthPx;

      const horizontalOverlap = characterLeft < obstacleRight && characterRight > obstacleLeft;
      const verticalOverlap = jumpOffsetPx < obstacleHeightPx;

      if (horizontalOverlap && verticalOverlap) {
        obstacle.consumed = true;
        triggerStumble(lastTimestampMs);
        break; // um tropeço por quadro já é suficiente
      }
    }
  }

  /** Ativa o estado de tropeço: sem parar o jogo, sem fail-state. */
  function triggerStumble(timestampMs) {
    isInvincible = true;
    invincibleUntilMs = timestampMs + STUMBLE_INVINCIBILITY_MS;
    if (typeof onStumble === "function") {
      onStumble();
    }
  }

  /**
   * Spawna itens colecionáveis, alternando entre "no chão" (coleta apenas
   * correndo por cima) e "flutuando" (exige pulo cronometrado) — dá ritmo
   * ao trajeto sem precisar de nenhuma configuração extra por fase.
   */
  function spawnItemsIfNeeded(scrollOffsetPx) {
    const spawnIndex = Math.floor(scrollOffsetPx / ITEM_SPAWN_DISTANCE_PX);
    if (spawnIndex <= lastItemSpawnIndex) return;

    for (let i = lastItemSpawnIndex + 1; i <= spawnIndex; i++) {
      // Pula este ciclo de spawn se um obstáculo nasceu muito perto no
      // tempo — eles nunca mais se separariam, já que viajam à mesma
      // velocidade (ver MIN_ITEM_OBSTACLE_SEPARATION_PX acima).
      const distanceFromLastObstacle = Math.abs(scrollOffsetPx - lastObstacleSpawnScrollOffsetPx);
      if (distanceFromLastObstacle < MIN_ITEM_OBSTACLE_SEPARATION_PX) {
        continue;
      }

      const isFloating = i % 2 === 1; // alterna: chão, flutuante, chão, flutuante...
      items.push({
        id: nextItemId++,
        spawnScrollOffsetPx: scrollOffsetPx,
        spawnXPx: stageWidthPx,
        xPx: stageWidthPx,
        heightPx: isFloating ? ITEM_FLOATING_HEIGHT_PX : ITEM_GROUND_HEIGHT_PX,
        collected: false,
      });
      lastItemSpawnScrollOffsetPx = scrollOffsetPx;
    }
    lastItemSpawnIndex = spawnIndex;
  }

  /** Recalcula a posição X de cada item e remove os que já saíram da tela. */
  function updateItemPositions(scrollOffsetPx) {
    for (const item of items) {
      const traveledSinceSpawnPx = scrollOffsetPx - item.spawnScrollOffsetPx;
      item.xPx = item.spawnXPx - traveledSinceSpawnPx;
    }
  }

  /**
   * Coleta automática por sobreposição (AABB), independente de toque —
   * o toque na tela serve exclusivamente para pular (ver checkObstacleCollisions
   * e a função jump(), mais abaixo). Itens flutuantes só são alcançados se
   * o personagem estiver no ar na altura certa quando passar por eles.
   */
  function checkItemCollection() {
    const characterLeft = CHARACTER_LEFT_PX;
    const characterRight = CHARACTER_LEFT_PX + CHARACTER_WIDTH_PX;
    const characterBottom = jumpOffsetPx;
    const characterTop = jumpOffsetPx + CHARACTER_HEIGHT_PX;

    for (const item of items) {
      if (item.collected) continue;

      const itemLeft = item.xPx;
      const itemRight = item.xPx + ITEM_SIZE_PX;
      const itemBottom = item.heightPx;
      const itemTop = item.heightPx + ITEM_SIZE_PX;

      const horizontalOverlap = characterLeft < itemRight && characterRight > itemLeft;
      const verticalOverlap = characterBottom < itemTop && characterTop > itemBottom;

      if (horizontalOverlap && verticalOverlap) {
        item.collected = true;
        collectedItemsCount += 1;
        console.log("ITEM COLETADO!", collectedItemsCount);
        if (typeof onItemCollected === "function") {
          // Repassa também o item coletado (posição X e altura), para que
          // a cena possa desenhar o efeito "+1" exatamente onde o item
          // estava, e não só o total acumulado.
          onItemCollected(collectedItemsCount, { xPx: item.xPx, heightPx: item.heightPx });
        }
      }
    }

    // Remove itens já coletados ou que saíram completamente pela esquerda —
    // em ambos os casos, a cena para de recebê-los em onItemsUpdate e cuida
    // sozinha do efeito visual de saída (ver phasePlay.js).
    items = items.filter((item) => !item.collected && item.xPx + ITEM_SIZE_PX > 0);
  }

  function complete() {
    if (hasCompleted) return;
    hasCompleted = true;
    stop();
    if (typeof onComplete === "function") {
      onComplete();
    }
  }

  /** Inicia (ou reinicia) o loop do motor, zerando todo o estado de jogo. */
  function start() {
    stop(); // segurança: evita dois loops rodando simultaneamente

    startTimestampMs = null;
    lastTimestampMs = null;
    hasCompleted = false;

    jumpOffsetPx = 0;
    jumpVelocityPxPerSecond = 0;
    isJumping = false;

    isInvincible = false;
    invincibleUntilMs = 0;

    obstacles = [];
    lastObstacleSpawnIndex = -1;
    lastObstacleSpawnScrollOffsetPx = -Infinity;

    items = [];
    lastItemSpawnIndex = -1;
    lastItemSpawnScrollOffsetPx = -Infinity;
    collectedItemsCount = 0;

    animationFrameId = requestAnimationFrame(tick);
  }

  /** Interrompe o loop sem disparar onComplete (ex.: ao sair da cena). */
  function stop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /** Dispara um pulo. Ignorado silenciosamente se o personagem já está no ar. */
  function jump() {
    if (isJumping) return;
    isJumping = true;
    jumpVelocityPxPerSecond = JUMP_INITIAL_VELOCITY_PX_PER_SECOND;
  }

  return { start, stop, jump };
}
