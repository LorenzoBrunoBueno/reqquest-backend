import type { Request, Response } from "express";
import {
  atualizarRequisitoBodySchema,
  criarRequisitoBodySchema,
  gerarRequisitoBodySchema,
  listarRequisitosQuerySchema,
} from "../schemas/requisito.schema";
import * as requisitoService from "../services/requisito.service";

// POST /requisitos/gerar
// Placeholder: futuramente vai chamar a Gemini API para gerar requisitos novos,
// validar o retorno e inserir no banco via Prisma. Por enquanto retorna um mock.
export async function gerarRequisito(req: Request, res: Response) {
  const parsedBody = gerarRequisitoBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const requisitosGerados = await requisitoService.gerarRequisitosMock(parsedBody.data);

  return res.status(200).json({
    mock: true,
    requisitos: requisitosGerados,
  });
}

// -----------------------------------------------------------------------
// CRUD real de requisitos (RF06/RF07).
// -----------------------------------------------------------------------
export async function listarRequisitos(req: Request, res: Response) {
  const parsedQuery = listarRequisitosQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({
      erro: "Query invalida",
      detalhes: parsedQuery.error.flatten().fieldErrors,
    });
  }

  const requisitos = await requisitoService.listarRequisitos(parsedQuery.data);
  return res.status(200).json(requisitos);
}

export async function obterRequisito(req: Request, res: Response) {
  const requisito = await requisitoService.obterRequisitoPorId(req.params.id);
  if (!requisito) return res.status(404).json({ erro: "Requisito nao encontrado" });
  return res.status(200).json(requisito);
}

export async function criarRequisito(req: Request, res: Response) {
  const parsedBody = criarRequisitoBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const requisito = await requisitoService.criarRequisito(parsedBody.data);
  if (!requisito) {
    return res.status(400).json({ erro: "temaId nao corresponde a um mundo existente" });
  }
  return res.status(201).json(requisito);
}

export async function atualizarRequisito(req: Request, res: Response) {
  const parsedBody = atualizarRequisitoBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const requisito = await requisitoService.atualizarRequisito(req.params.id, parsedBody.data);
  if (requisito === undefined) {
    return res.status(404).json({ erro: "Requisito nao encontrado" });
  }
  if (requisito === null) {
    return res.status(400).json({ erro: "temaId nao corresponde a um mundo existente" });
  }
  return res.status(200).json(requisito);
}

export async function excluirRequisito(req: Request, res: Response) {
  const excluido = await requisitoService.excluirRequisito(req.params.id);
  if (!excluido) return res.status(404).json({ erro: "Requisito nao encontrado" });
  return res.status(204).send();
}
