import { prisma } from "../lib/prisma";
import type { ListarPartidasDoUsuarioQuery } from "../schemas/usuario.schema";

export function obterUsuario(usuarioId: number) {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, telefone: true, email: true, role: true },
  });
}

// DB.getPlayerProgress() (data.js) -> { xp, badges }. RANKS/XP_PER_LEVEL/tier
// ficam so no frontend (funcoes puras derivadas do xp bruto).
export async function obterProgresso(usuarioId: number) {
  const [progresso, badges] = await Promise.all([
    prisma.progressoJogador.findUnique({ where: { usuarioId } }),
    prisma.badgeDesbloqueado.findMany({ where: { usuarioId }, select: { badgeId: true } }),
  ]);

  return {
    xp: progresso?.xp ?? 0,
    badges: badges.map((b) => b.badgeId),
  };
}

export function listarPartidasDoUsuario(usuarioId: number, query: ListarPartidasDoUsuarioQuery) {
  return prisma.partida.findMany({
    where: { usuarioId, temaId: query.temaId },
    orderBy: { dataJogo: query.order },
  });
}

// "Nova Jornada" (main.js) — igual ao mock, mas escopado ao usuario logado:
// o mock zera TODAS as partidas do localStorage porque so existe 1 usuario
// local; aqui precisa apagar so o que e desse usuario_id, sem afetar o
// ranking de mais ninguem.
export async function resetarJornada(usuarioId: number) {
  await prisma.$transaction([
    prisma.partida.deleteMany({ where: { usuarioId } }),
    prisma.badgeDesbloqueado.deleteMany({ where: { usuarioId } }),
    prisma.progressoJogador.upsert({
      where: { usuarioId },
      create: { usuarioId, xp: 0 },
      update: { xp: 0 },
    }),
  ]);

  return { xp: 0, badges: [] as string[] };
}
