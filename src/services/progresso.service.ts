// Logica pura de XP/nivel, sem Prisma — testavel isoladamente.
// Mesma formula usada no frontend (js/data.js): XP_PER_LEVEL = 100,
// nivel = floor(xp/100) + 1.
export const XP_PER_LEVEL = 100;

export function calcularNivel(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

// Espelha GameView.endGame (game.js): 10 XP por acerto, +20 se o baralho do
// mundo foi classificado por completo antes do tempo acabar.
export function calcularXpGanho(dados: { acertos: number; deckCompleto?: boolean }): number {
  return dados.acertos * 10 + (dados.deckCompleto ? 20 : 0);
}
