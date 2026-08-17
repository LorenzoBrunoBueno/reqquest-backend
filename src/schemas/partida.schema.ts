import { z } from "zod";

// Espelha o que GameView.endGame (game.js) manda pra DB.addPartida, mais os
// dois campos usados so pra avaliar badges no servidor (maiorSequencia,
// respostasRapidas) e o flag de baralho completo (bonus de XP).
export const registrarPartidaBodySchema = z.object({
  temaId: z.string().trim().min(1, "temaId e obrigatorio"),
  score: z.number().int().min(0),
  acertos: z.number().int().min(0),
  erros: z.number().int().min(0),
  nivel: z.number().int().min(1),
  maiorSequencia: z.number().int().min(0).default(0),
  respostasRapidas: z.number().int().min(0).default(0),
  deckCompleto: z.boolean().default(false),
});

export type RegistrarPartidaBody = z.infer<typeof registrarPartidaBodySchema>;

export const listarPartidasQuerySchema = z.object({
  temaId: z.string().trim().min(1).optional(),
  orderBy: z.enum(["score", "data"]).default("score"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export type ListarPartidasQuery = z.infer<typeof listarPartidasQuerySchema>;
