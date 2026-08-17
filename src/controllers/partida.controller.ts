import type { Request, Response } from "express";
import { listarPartidasQuerySchema, registrarPartidaBodySchema } from "../schemas/partida.schema";
import * as partidaService from "../services/partida.service";

// POST /partidas — auth opcional (ver middlewares/auth.middleware.ts::optionalAuth).
export async function registrarPartida(req: Request, res: Response) {
  const parsedBody = registrarPartidaBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const resultado = await partidaService.registrarPartida(
    req.usuarioId ?? null,
    parsedBody.data
  );
  if (!resultado) {
    return res.status(400).json({ erro: "temaId nao corresponde a um mundo existente" });
  }

  return res.status(201).json(resultado);
}

export async function listarPartidas(req: Request, res: Response) {
  const parsedQuery = listarPartidasQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      erro: "Query invalida",
      detalhes: parsedQuery.error.flatten().fieldErrors,
    });
  }

  const partidas = await partidaService.listarPartidas(parsedQuery.data);
  return res.status(200).json(partidas);
}
