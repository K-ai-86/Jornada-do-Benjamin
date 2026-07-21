/**
 * scenes/intro.js
 * ------------------------------------------------------------------------
 * Tela de Introdução — apresenta Benjamin e sua missão antes da primeira
 * ilha. Texto narrativo estático (Opção A do GDD, sem animação de entrada
 * complexa), seguindo a mesma identidade visual da Tela de Título.
 *
 * Ao avançar, leva à cena "phase_1_play" — por enquanto um placeholder,
 * que será substituído pelo motor de jogo real nos Módulos 3+.
 * ------------------------------------------------------------------------
 */

export const introScene = {
  render(root, { goTo }) {
    root.innerHTML = `
      <section class="intro-screen" aria-labelledby="intro-screen-heading">
        <div class="hero-icon" role="img" aria-label="Benjamin, o Leão Solar"></div>

        <h2 class="intro-screen__heading" id="intro-screen-heading">
          Benjamin, o Leãozinho Solar
        </h2>

        <div class="intro-screen__text">
          <p>
            Benjamin é um leãozinho especial, que brilha de um jeito só seu.
          </p>
          <p>
            Ele nasceu diferente: e é exatamente esse jeito único que é
            a origem da sua força.
          </p>
          <p>
            Agora ele parte em uma jornada por quatro ilhas mágicas para
            despertar seus poderes, superar desafios e espalhar luz por
            onde passar.
          </p>
        </div>

        <button type="button" class="btn-primary" id="btn-begin-journey">
          Começar Jornada
        </button>
      </section>
    `;

    const beginButton = root.querySelector("#btn-begin-journey");

    function handleBeginClick() {
      // "phase_1_play" ainda é um placeholder — o motor de jogo real
      // chega nos Módulos 3+.
      goTo("phase_1_play");
    }

    beginButton.addEventListener("click", handleBeginClick);

    return () => {
      beginButton.removeEventListener("click", handleBeginClick);
    };
  },
};
