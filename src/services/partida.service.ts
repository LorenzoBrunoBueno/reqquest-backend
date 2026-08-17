import { prisma } from "../lib/prisma";
import { avaliarBadges } from "./badge.service";
import { calcularNivel, calcularXpGanho } from "./progresso.service";
import type { ListarPartidasQuery, RegistrarPartidaBody } from "../schemas/partida.schema";

export type RegistrarPartidaResultado = {
  partida: Awaited<ReturnType<typeof prisma.partida.create>>;
  progresso: { xp: number; level: number; leveledUp: boolean } | null;
  badgesNovas: string[];
};

// Espelha GameView.endGame + Badges.checkAfterGame (game.js/badges.js), mas
// tudo numa transacao no servidor: cria a partida, e se houver usuario
// autenticado, soma XP e persiste badges novas. Partida anonima (usuarioId
// nulo) so entra no ranking, sem XP/badge — nao ha "progresso" pra atualizar
// sem um usuario. Retorna null se `temaId` nao corresponder a um mundo
// existente, pro controller decidir o 400.
export async function registrarPartida(
  usuarioId: number | null,
  dados: RegistrarPartidaBody
): Promise<RegistrarPartidaResultado | null> {
  return prisma.$transaction(async (tx) => {
    const tema = await tx.tema.findUnique({ where: { id: dados.temaId } });
    if (!tema) return null;

    // Nunca confia em nome vindo do client — resolve pelo usuario autenticado
    // (se houver) e cai pra "Anônimo" senao, igual o mock faz hoje.
    const usuario = usuarioId ? await tx.usuario.findUnique({ where: { id: usuarioId } }) : null;

    const partida = await tx.partida.create({
      data: {
        usuarioId: usuario?.id ?? null,
        usuarioNome: usuario?.nome ?? "Anônimo",
        temaId: tema.id,
        temaNome: tema.nome,
        score: dados.score,
        acertos: dados.acertos,
        erros: dados.erros,
        nivel: dados.nivel,
        maiorSequencia: dados.maiorSequencia,
        respostasRapidas: dados.respostasRapidas,
      },
    });

    if (!usuario) {
      return { partida, progresso: null, badgesNovas: [] };
    }

    const progressoAntes = await tx.progressoJogador.findUnique({
      where: { usuarioId: usuario.id },
    });
    const xpAntes = progressoAntes?.xp ?? 0;
    const xpDepois = xpAntes + calcularXpGanho(dados);

    await tx.progressoJogador.upsert({
      where: { usuarioId: usuario.id },
      create: { usuarioId: usuario.id, xp: xpDepois },
      update: { xp: xpDepois },
    });

    const totalPartidas = await tx.partida.count({ where: { usuarioId: usuario.id } });
    const badgesExistentes = await tx.badgeDesbloqueado.findMany({
      where: { usuarioId: usuario.id },
      select: { badgeId: true },
    });

    const badgesNovas = avaliarBadges(
      {
        totalPartidas,
        acertos: dados.acertos,
        erros: dados.erros,
        respostasRapidas: dados.respostasRapidas,
        maiorSequencia: dados.maiorSequencia,
      },
      badgesExistentes.map((b) => b.badgeId)
    );

    if (badgesNovas.length > 0) {
      await tx.badgeDesbloqueado.createMany({
        data: badgesNovas.map((badgeId) => ({ usuarioId: usuario.id, badgeId })),
      });
    }

    return {
      partida,
      progresso: {
        xp: xpDepois,
        level: calcularNivel(xpDepois),
        leveledUp: calcularNivel(xpDepois) > calcularNivel(xpAntes),
      },
      badgesNovas,
    };
  });
}

// Ranking global (RelatoriosView) — todos os jogadores, filtravel por mundo.
export function listarPartidas(query: ListarPartidasQuery) {
  return prisma.partida.findMany({
    where: { temaId: query.temaId },
    orderBy: query.orderBy === "score" ? { score: query.order } : { dataJogo: query.order },
    take: query.limit,
  });
}
