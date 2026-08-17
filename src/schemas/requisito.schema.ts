import { z } from "zod";

// Valida o corpo da requisicao de POST /requisitos/gerar.
// O usuario escolhe um tema (ex.: "Sistema de Restaurante") e,
// opcionalmente, quantos requisitos quer gerar.
export const gerarRequisitoBodySchema = z.object({
  tema: z.string().min(3, "tema deve ter pelo menos 3 caracteres"),
  quantidade: z.number().int().min(1).max(10).default(1),
});

export type GerarRequisitoBody = z.infer<typeof gerarRequisitoBodySchema>;

// Enum espelhando o campo "tipo" do model Requisito no schema.prisma.
export const tipoRequisitoSchema = z.enum(["FUNCIONAL", "NAO_FUNCIONAL"]);

// Valida o formato esperado de UM requisito retornado pela Gemini API,
// antes de inserirmos qualquer coisa no banco. Isso garante que texto
// gerado pela IA nunca entra no banco sem o formato certo.
export const requisitoGeradoPelaIaSchema = z.object({
  tema: z.string().min(3),
  descricao: z.string().min(10, "descricao gerada muito curta"),
  tipo: tipoRequisitoSchema,
});

export type RequisitoGeradoPelaIa = z.infer<typeof requisitoGeradoPelaIaSchema>;

// A Gemini deve retornar uma lista de requisitos gerados.
export const respostaGeminiSchema = z.object({
  requisitos: z.array(requisitoGeradoPelaIaSchema),
});

export type RespostaGemini = z.infer<typeof respostaGeminiSchema>;

// -----------------------------------------------------------------------
// CRUD real de requisitos (RF06/RF07). O contrato de API usa exatamente os
// valores que o frontend compara literalmente em game.js/crud.js
// ('funcional' / 'nao-funcional') — a traducao pro enum do Prisma
// (FUNCIONAL/NAO_FUNCIONAL) fica em requisito.service.ts.
// -----------------------------------------------------------------------
export const tipoRequisitoWireSchema = z.enum(["funcional", "nao-funcional"]);

export type TipoRequisitoWire = z.infer<typeof tipoRequisitoWireSchema>;

export const criarRequisitoBodySchema = z.object({
  temaId: z.string().trim().min(1, "temaId e obrigatorio"),
  texto: z.string().trim().min(1, "texto e obrigatorio"),
  tipo: tipoRequisitoWireSchema,
});

export type CriarRequisitoBody = z.infer<typeof criarRequisitoBodySchema>;

export const atualizarRequisitoBodySchema = criarRequisitoBodySchema.partial();

export type AtualizarRequisitoBody = z.infer<typeof atualizarRequisitoBodySchema>;

export const listarRequisitosQuerySchema = z.object({
  temaId: z.string().trim().min(1).optional(),
  tipo: tipoRequisitoWireSchema.optional(),
  texto: z.string().trim().min(1).optional(),
});

export type ListarRequisitosQuery = z.infer<typeof listarRequisitosQuerySchema>;
