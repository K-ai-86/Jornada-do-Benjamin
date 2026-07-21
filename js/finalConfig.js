/**
 * finalConfig.js
 * ------------------------------------------------------------------------
 * Dados do clímax final (transformação em Leão Solar) e da Tela de
 * Encerramento. Mantido separado de phaseConfig.js de propósito: aquele
 * arquivo é escopado às 4 ilhas jogáveis (mesma estrutura repetida por
 * fase); este aqui é conteúdo único, que aparece uma única vez no jogo.
 * ------------------------------------------------------------------------
 */

export const finalConfig = {
  // Arte final da transformação — caminho lógico, pronto para receber o
  // recorte definitivo em assets/final/. Até lá, a cena e o CSS já têm
  // um fallback visual neutro (mesmo padrão adotado no Módulo 7).
  leaoSolarImage: "assets/final/leao-solar.png",

  // Mensagem de identidade do clímax (origem: painel/GDD), exibida linha
  // a linha para reforçar o impacto de cada frase.
  identityMessageLines: [
    "Você é luz.",
    "Você é força.",
    "Você é inspiração.",
    "Você é Benjamin!",
  ],

  // Tela de Encerramento — CTA de WhatsApp (Módulo 10).
  // Número no formato internacional exigido pela API do WhatsApp
  // (só dígitos, sem "+", espaços ou traços): +55 86 99943-9084.
  whatsappPhoneNumber: "5586999439084",
  whatsappMessage:
    "Parabéns, Benjamin! Você é luz, força e inspiração. Adorei jogar a sua jornada e fazer parte desse dia tão especial!",
  endingThankYouTitle: "Obrigado por fazer parte dessa jornada!",
  endingThankYouMessage:
    "Sua presença e seu carinho tornam essa comemoração ainda mais especial.",
  whatsappButtonLabel: "Mandar Carinho para o Benjamin",
};
