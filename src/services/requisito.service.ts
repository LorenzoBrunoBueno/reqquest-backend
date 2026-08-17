import type { Requisito, TipoRequisito } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type {
  AtualizarRequisitoBody,
  CriarRequisitoBody,
  GerarRequisitoBody,
  ListarRequisitosQuery,
  RequisitoGeradoPelaIa,
  TipoRequisitoWire,
} from "../schemas/requisito.schema";

// TODO: substituir este mock pela chamada real a Gemini API (src/lib/gemini.ts).
// Quando a integracao real for feita, o retorno desta funcao deve ser validado
// com "respostaGeminiSchema" (src/schemas/requisito.schema.ts) antes de ser
// inserido no banco via Prisma.
export async function gerarRequisitosMock(
  body: GerarRequisitoBody
): Promise<RequisitoGeradoPelaIa[]> {
  const requisitos: RequisitoGeradoPelaIa[] = Array.from({ length: body.quantidade }).map(
    (_, index) => ({
      tema: body.tema,
      descricao: `[MOCK] Requisito de exemplo #${index + 1} para o tema "${body.tema}"`,
      tipo: index % 2 === 0 ? "FUNCIONAL" : "NAO_FUNCIONAL",
    })
  );

  return requisitos;
}

// -----------------------------------------------------------------------
// CRUD real de requisitos (RF06/RF07). O Prisma usa o enum FUNCIONAL/
// NAO_FUNCIONAL (consistente com o mock acima); o contrato de API usa
// 'funcional'/'nao-funcional', exatamente como game.js/crud.js comparam.
// -----------------------------------------------------------------------
function tipoParaPrisma(tipo: TipoRequisitoWire): TipoRequisito {
  return tipo === "funcional" ? "FUNCIONAL" : "NAO_FUNCIONAL";
}

function tipoParaWire(tipo: TipoRequisito): TipoRequisitoWire {
  return tipo === "FUNCIONAL" ? "funcional" : "nao-funcional";
}

export type RequisitoWire = {
  id: string;
  temaId: string;
  texto: string;
  tipo: TipoRequisitoWire;
};

function paraWire(requisito: Requisito): RequisitoWire {
  return {
    id: requisito.id,
    temaId: requisito.temaId,
    texto: requisito.texto,
    tipo: tipoParaWire(requisito.tipo),
  };
}

export async function listarRequisitos(
  query: ListarRequisitosQuery
): Promise<RequisitoWire[]> {
  const requisitos = await prisma.requisito.findMany({
    where: {
      temaId: query.temaId,
      tipo: query.tipo ? tipoParaPrisma(query.tipo) : undefined,
      texto: query.texto ? { contains: query.texto } : undefined,
    },
  });
  return requisitos.map(paraWire);
}

export async function obterRequisitoPorId(id: string): Promise<RequisitoWire | null> {
  const requisito = await prisma.requisito.findUnique({ where: { id } });
  return requisito ? paraWire(requisito) : null;
}

// Retorna null se o temaId informado nao existir, pro controller decidir o 400.
export async function criarRequisito(dados: CriarRequisitoBody): Promise<RequisitoWire | null> {
  const tema = await prisma.tema.findUnique({ where: { id: dados.temaId } });
  if (!tema) return null;

  const requisito = await prisma.requisito.create({
    data: {
      temaId: dados.temaId,
      texto: dados.texto,
      tipo: tipoParaPrisma(dados.tipo),
    },
  });
  return paraWire(requisito);
}

// Retorna undefined se o requisito nao existir, e null se o novo temaId
// (quando informado) nao existir — o controller distingue 404 de 400.
export async function atualizarRequisito(
  id: string,
  dados: AtualizarRequisitoBody
): Promise<RequisitoWire | null | undefined> {
  const requisito = await prisma.requisito.findUnique({ where: { id } });
  if (!requisito) return undefined;

  if (dados.temaId) {
    const tema = await prisma.tema.findUnique({ where: { id: dados.temaId } });
    if (!tema) return null;
  }

  const atualizado = await prisma.requisito.update({
    where: { id },
    data: {
      temaId: dados.temaId,
      texto: dados.texto,
      tipo: dados.tipo ? tipoParaPrisma(dados.tipo) : undefined,
    },
  });
  return paraWire(atualizado);
}

export async function excluirRequisito(id: string): Promise<boolean> {
  const requisito = await prisma.requisito.findUnique({ where: { id } });
  if (!requisito) return false;
  await prisma.requisito.delete({ where: { id } });
  return true;
}
