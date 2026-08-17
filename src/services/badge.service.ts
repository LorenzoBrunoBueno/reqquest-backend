// Espelha as 4 condicoes de Badges.LIST (frontend/reqquest/js/badges.js).
// O catalogo (nome/icone/descricao) fica so no frontend — aqui so avaliamos
// as condicoes a partir dos dados persistidos de uma partida, pra que a
// checagem nao dependa so do estado em memoria do client.
export type EstatisticasPartida = {
  totalPartidas: number;
  acertos: number;
  erros: number;
  respostasRapidas: number;
  maiorSequencia: number;
};

type BadgeCheck = { id: string; check: (stats: EstatisticasPartida) => boolean };

export const BADGE_CHECKS: BadgeCheck[] = [
  { id: "primeira-vitoria", check: (s) => s.totalPartidas >= 1 },
  { id: "perfeccionista", check: (s) => s.acertos >= 5 && s.erros === 0 },
  { id: "speedrunner", check: (s) => s.respostasRapidas >= 5 },
  { id: "sequencia-fogo", check: (s) => s.maiorSequencia >= 5 },
];

// Retorna so os ids de badge que passam a bater a condicao agora e ainda nao
// estavam em `jaDesbloqueadas` — idempotente por natureza (chamar de novo com
// as mesmas stats nao repete um badge ja concedido).
export function avaliarBadges(
  stats: EstatisticasPartida,
  jaDesbloqueadas: string[]
): string[] {
  const desbloqueadasSet = new Set(jaDesbloqueadas);
  return BADGE_CHECKS.filter((b) => !desbloqueadasSet.has(b.id) && b.check(stats)).map(
    (b) => b.id
  );
}
