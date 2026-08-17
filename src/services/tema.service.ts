import { prisma } from "../lib/prisma";
import type { AtualizarTemaBody, CriarTemaBody } from "../schemas/tema.schema";

// Nunca inclui as colunas Bytes (iconeImagem/fundoImagem) aqui — listagem e
// detalhe so precisam saber SE existe imagem (os campos *Tipo bastam pra
// isso, ver tema.controller.ts::serializarTema). Os bytes em si só são lidos
// pelos endpoints de streaming (obterImagemIcone/obterImagemFundo).
const CAMPOS_LISTAGEM = {
  id: true,
  nome: true,
  descricao: true,
  icone: true,
  fundo: true,
  gradStart: true,
  gradEnd: true,
  unlockTier: true,
  iconeImagemTipo: true,
  fundoImagemTipo: true,
} as const;

export function listarTemas() {
  return prisma.tema.findMany({ orderBy: { unlockTier: "asc" }, select: CAMPOS_LISTAGEM });
}

export function obterTema(id: string) {
  return prisma.tema.findUnique({ where: { id }, select: CAMPOS_LISTAGEM });
}

export type ArquivoImagem = { buffer: Buffer; mimetype: string };
export type ArquivosTema = { iconeArquivo?: ArquivoImagem; fundoArquivo?: ArquivoImagem };

// Um arquivo novo sempre tem prioridade sobre a flag de "remover", caso as
// duas venham juntas na mesma requisicao (nao deveria acontecer pela UI, mas
// o comportamento do backend precisa ser deterministico de qualquer forma).
function montarCamposImagem(dados: CriarTemaBody | AtualizarTemaBody, arquivos: ArquivosTema) {
  const campos: Record<string, unknown> = {};
  if (arquivos.iconeArquivo) {
    campos.iconeImagem = arquivos.iconeArquivo.buffer;
    campos.iconeImagemTipo = arquivos.iconeArquivo.mimetype;
  } else if (dados.removerIcone) {
    campos.iconeImagem = null;
    campos.iconeImagemTipo = null;
  }
  if (arquivos.fundoArquivo) {
    campos.fundoImagem = arquivos.fundoArquivo.buffer;
    campos.fundoImagemTipo = arquivos.fundoArquivo.mimetype;
  } else if (dados.removerFundo) {
    campos.fundoImagem = null;
    campos.fundoImagemTipo = null;
  }
  return campos;
}

export function criarTema(dados: CriarTemaBody, arquivos: ArquivosTema = {}) {
  const { removerIcone, removerFundo, ...resto } = dados;
  return prisma.tema.create({
    data: { ...resto, ...montarCamposImagem(dados, arquivos) },
    select: CAMPOS_LISTAGEM,
  });
}

// Retorna null se o tema nao existir, pro controller decidir o 404 — sem
// precisar de um findUnique extra so pra checar existencia antes.
export async function atualizarTema(id: string, dados: AtualizarTemaBody, arquivos: ArquivosTema = {}) {
  const existe = await prisma.tema.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return null;
  const { removerIcone, removerFundo, ...resto } = dados;
  return prisma.tema.update({
    where: { id },
    data: { ...resto, ...montarCamposImagem(dados, arquivos) },
    select: CAMPOS_LISTAGEM,
  });
}

export async function excluirTema(id: string): Promise<boolean> {
  const tema = await obterTema(id);
  if (!tema) return false;
  // ON DELETE CASCADE em requisitos.tema_id cuida dos requisitos do mundo.
  await prisma.tema.delete({ where: { id } });
  return true;
}

// Usados só pelos dois endpoints de streaming (GET /temas/:id/icone|fundo) —
// nunca pelo list/detail/write acima, pra nao inflar essas respostas com os
// bytes crus da imagem.
export async function obterImagemIcone(id: string) {
  const tema = await prisma.tema.findUnique({
    where: { id },
    select: { iconeImagem: true, iconeImagemTipo: true },
  });
  if (!tema?.iconeImagem) return null;
  return { dados: tema.iconeImagem, tipo: tema.iconeImagemTipo || "application/octet-stream" };
}

export async function obterImagemFundo(id: string) {
  const tema = await prisma.tema.findUnique({
    where: { id },
    select: { fundoImagem: true, fundoImagemTipo: true },
  });
  if (!tema?.fundoImagem) return null;
  return { dados: tema.fundoImagem, tipo: tema.fundoImagemTipo || "application/octet-stream" };
}
