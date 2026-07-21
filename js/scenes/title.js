/**
 * scenes/title.js
 * ------------------------------------------------------------------------
 * Tela de Título — primeira tela real do jogo.
 *
 * Responsabilidade: apresentar o título oficial e um único ponto de ação
 * ("Iniciar Jornada"), que leva à cena "intro". Nenhuma lógica de jogo
 * vive aqui — apenas a tela e a transição para a próxima cena.
 * ------------------------------------------------------------------------
 */

export const titleScene = {
  render(root, { goTo }) {
    root.innerHTML = `
      <section class="title-screen" aria-labelledby="title-screen-heading">
        <div class="hero-icon hero-icon--large" role="img" aria-label="Benjamin, o Leão Solar"></div>

        <div class="title-screen__halo" aria-hidden="true"></div>

        <p class="title-screen__eyebrow">
          Uma aventura sobre coragem, sabedoria, alegria e amor
        </p>

        <h1 class="title-screen__title" id="title-screen-heading">
          A Jornada de Benjamin
          <span>O Leão Solar</span>
        </h1>

        <button type="button" class="btn-primary" id="btn-start-journey">
          Iniciar Jornada
        </button>
      </section>
    `;

    const startButton = root.querySelector("#btn-start-journey");

    function handleStartClick() {
      // Por enquanto, "intro" é um placeholder (Módulo 2 o substitui).
      goTo("intro");
    }

    startButton.addEventListener("click", handleStartClick);

    // Função de limpeza: remove o listener ao sair desta cena.
    return () => {
      startButton.removeEventListener("click", handleStartClick);
    };
  },
};
