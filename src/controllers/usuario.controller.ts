import type { Request, Response } from "express";
import { listarPartidasDoUsuarioQuerySchema } from "../schemas/usuario.schema";
import * as usuarioService from "../services/usuario.service";

// Todas as rotas aqui exigem requireAuth — req.usuarioId sempre presente.

export async function obterUsuarioLogado(req: Request, res: Response) {
  const usuario = await usuarioService.obterUsuario(req.usuarioId as number);
  if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado" });
  return res.status(200).json(usuario);
}

export async function obterProgresso(req: Request, res: Response) {
  const progresso = await usuarioService.obterProgresso(req.usuarioId as number);
  return res.status(200).json(progresso);
}

export async function listarPartidasDoUsuario(req: Request, res: Response) {
  const parsedQuery = listarPartidasDoUsuarioQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      erro: "Query invalida",
      detalhes: parsedQuery.error.flatten().fieldErrors,
    });
  }

  const partidas = await usuarioService.listarPartidasDoUsuario(
    req.usuarioId as number,
    parsedQuery.data
  );
  return res.status(200).json(partidas);
}

export async function resetarJornada(req: Request, res: Response) {
  const resultado = await usuarioService.resetarJornada(req.usuarioId as number);
  return res.status(200).json(resultado);
}
