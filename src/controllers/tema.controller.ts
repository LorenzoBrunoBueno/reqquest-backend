import type { Request, Response } from "express";
import { atualizarTemaBodySchema, criarTemaBodySchema } from "../schemas/tema.schema";
import * as temaService from "../services/tema.service";

type TemaComTipos = NonNullable<Awaited<ReturnType<typeof temaService.obterTema>>>;
type ArquivosMulter = { iconeArquivo?: Express.Multer.File[]; fundoArquivo?: Express.Multer.File[] };

function urlBase(req: Request) {
  return `${req.protocol}://${req.get("host")}`;
}

// icone/fundo no JSON de resposta apontam pro endpoint de streaming quando
// existe imagem enviada (iconeImagemTipo/fundoImagemTipo != null); caso
// contrario, caem no valor legado da coluna de texto (caminho estatico do
// seed, ou string que alguem tenha colado direto na API).
function serializarTema(tema: TemaComTipos, req: Request) {
  const { iconeImagemTipo, fundoImagemTipo, ...resto } = tema;
  return {
    ...resto,
    icone: iconeImagemTipo ? `${urlBase(req)}/temas/${tema.id}/icone` : tema.icone,
    fundo: fundoImagemTipo ? `${urlBase(req)}/temas/${tema.id}/fundo` : tema.fundo,
  };
}

function extrairArquivos(req: Request) {
  const arquivos = req.files as ArquivosMulter | undefined;
  return {
    iconeArquivo: arquivos?.iconeArquivo?.[0]
      ? { buffer: arquivos.iconeArquivo[0].buffer, mimetype: arquivos.iconeArquivo[0].mimetype }
      : undefined,
    fundoArquivo: arquivos?.fundoArquivo?.[0]
      ? { buffer: arquivos.fundoArquivo[0].buffer, mimetype: arquivos.fundoArquivo[0].mimetype }
      : undefined,
  };
}

export async function listarTemas(req: Request, res: Response) {
  const temas = await temaService.listarTemas();
  return res.status(200).json(temas.map((tema) => serializarTema(tema, req)));
}

export async function obterTema(req: Request, res: Response) {
  const tema = await temaService.obterTema(req.params.id);
  if (!tema) return res.status(404).json({ erro: "Tema nao encontrado" });
  return res.status(200).json(serializarTema(tema, req));
}

export async function criarTema(req: Request, res: Response) {
  const parsedBody = criarTemaBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const tema = await temaService.criarTema(parsedBody.data, extrairArquivos(req));
  return res.status(201).json(serializarTema(tema, req));
}

export async function atualizarTema(req: Request, res: Response) {
  const parsedBody = atualizarTemaBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const tema = await temaService.atualizarTema(req.params.id, parsedBody.data, extrairArquivos(req));
  if (!tema) return res.status(404).json({ erro: "Tema nao encontrado" });
  return res.status(200).json(serializarTema(tema, req));
}

export async function excluirTema(req: Request, res: Response) {
  const excluido = await temaService.excluirTema(req.params.id);
  if (!excluido) return res.status(404).json({ erro: "Tema nao encontrado" });
  return res.status(204).send();
}

// Streaming das imagens binarias — trickiest bit: res.send(Buffer) escreve os
// bytes crus com o Content-Type já setado; res.json() corromperia o binário
// (serializaria o Buffer como {"type":"Buffer","data":[...]}).
export async function obterIconeTema(req: Request, res: Response) {
  const imagem = await temaService.obterImagemIcone(req.params.id);
  if (!imagem) return res.status(404).end();
  res.set("Content-Type", imagem.tipo);
  res.set("Cache-Control", "public, max-age=86400");
  return res.send(imagem.dados);
}

export async function obterFundoTema(req: Request, res: Response) {
  const imagem = await temaService.obterImagemFundo(req.params.id);
  if (!imagem) return res.status(404).end();
  res.set("Content-Type", imagem.tipo);
  res.set("Cache-Control", "public, max-age=86400");
  return res.send(imagem.dados);
}
