/**
 * audioManager.js
 * ------------------------------------------------------------------------
 * Controla a trilha sonora de fundo do jogo: um único elemento <audio>,
 * criado uma única vez e reaproveitado durante toda a sessão — nenhuma
 * cena (title, intro, phasePlay, etc.) cria ou destrói este elemento,
 * então a música toca por trás das trocas de tela do sceneManager, sem
 * reiniciar ou engasgar.
 *
 * COM LOOP: a faixa (já cortada para os primeiros 90s / 1min30 da
 * música "Leão Solar", aproximadamente o tempo de jogo) toca em loop
 * contínuo, reiniciando do começo sempre que chega ao fim — assim o
 * jogo nunca fica em silêncio, mesmo que o jogador demore mais que
 * 90s nas telas de recompensa (que não têm tempo fixo).
 *
 * Autoplay: navegadores bloqueiam a reprodução de áudio com som até
 * haver uma interação real do usuário (toque/clique) na página. Por
 * isso `startMusic()` é feito para ser chamado a partir de um listener
 * de "primeiro toque" (ver main.js) — chamar antes disso simplesmente
 * falha em silêncio, sem quebrar nada, e a música começa no toque
 * seguinte.
 * ------------------------------------------------------------------------
 */

// Caminho do arquivo de música — ajuste aqui se o nome/local do arquivo
// no projeto for diferente. Já é o corte de 90s (1min30) da faixa
// original, com fade-out nos últimos segundos.
const MUSIC_SRC = "assets/audio/leao-solar.mp3";

// Volume de fundo: baixo o suficiente para não competir com a leitura
// da frase-tema de cada fase, mas perceptível.
const MUSIC_VOLUME = 0.55;

let audioElement = null;
let isMuted = false;

/** Cria (uma única vez) e retorna o elemento <audio> da trilha de fundo. */
function getAudioElement() {
  if (!audioElement) {
    audioElement = new Audio(MUSIC_SRC);
    audioElement.loop = true;
    audioElement.volume = MUSIC_VOLUME;
    audioElement.muted = isMuted;
  }
  return audioElement;
}

/**
 * Inicia a reprodução da trilha de fundo. Sem efeito se já estiver
 * tocando. Deve ser chamada a partir de uma interação do usuário
 * (toque/clique) — chamadas fora desse contexto são ignoradas
 * silenciosamente pelo navegador (ver comentário acima).
 */
export function startMusic() {
  const audio = getAudioElement();
  if (!audio.paused) return;
  audio.play().catch(() => {
    // Autoplay bloqueado pelo navegador (ex.: chamada não veio de uma
    // interação real) — a música começa no próximo toque do usuário.
  });
}

/**
 * Alterna entre mudo e som. Retorna o novo estado (true = mudo agora).
 * Funciona mesmo que a reprodução ainda não tenha começado.
 */
export function toggleMute() {
  isMuted = !isMuted;
  getAudioElement().muted = isMuted;
  return isMuted;
}

/** Estado atual (true = mudo). Útil para sincronizar o ícone do botão. */
export function getIsMuted() {
  return isMuted;
}
