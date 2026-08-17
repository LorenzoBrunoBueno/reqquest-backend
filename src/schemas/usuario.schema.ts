import { z } from "zod";

// GET /usuarios/me/partidas — historico do jogador logado (RelatoriosView usa
// ordem cronologica pro grafico de evolucao, DashboardView usa so a contagem).
export const listarPartidasDoUsuarioQuerySchema = z.object({
  temaId: z.string().trim().min(1).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ListarPartidasDoUsuarioQuery = z.infer<typeof listarPartidasDoUsuarioQuerySchema>;
