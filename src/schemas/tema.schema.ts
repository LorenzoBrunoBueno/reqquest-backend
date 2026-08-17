import { z } from "zod";

// "true"/"1" -> true, qualquer outra string (incl. "false") -> false. Nao usar
// z.coerce.boolean() aqui: ele so checa Boolean(valor), e a string "false" e
// truthy, entao viraria true por engano.
const booleanoDeString = (schema: z.ZodTypeAny) =>
  z.preprocess((valor) => (typeof valor === "string" ? valor === "true" || valor === "1" : valor), schema);

// Espelha os campos do CRUD de mundos (TemaModalContent.jsx / DB.addTema).
// unlockTier usa z.coerce.number() porque chega como string quando o corpo e
// multipart/form-data (upload de icone/fundo) — continua aceitando number puro
// nas chamadas JSON existentes.
export const criarTemaBodySchema = z.object({
  nome: z.string().trim().min(1, "nome e obrigatorio"),
  descricao: z.string().trim().optional(),
  // Ainda aceitos para quem chamar a API sem enviar arquivo (ex.: script_banc2
  // legado, chamadas diretas). Quando um arquivo e enviado, ele tem prioridade
  // — ver tema.service.ts (montarCamposImagem).
  icone: z.string().trim().optional(),
  fundo: z.string().trim().optional(),
  gradStart: z.string().trim().optional(),
  gradEnd: z.string().trim().optional(),
  unlockTier: z.coerce.number().int().min(1).optional(),
  // Reverte icone/fundo pro valor legado, removendo a imagem enviada.
  removerIcone: booleanoDeString(z.boolean().optional()),
  removerFundo: booleanoDeString(z.boolean().optional()),
});

export type CriarTemaBody = z.infer<typeof criarTemaBodySchema>;

export const atualizarTemaBodySchema = criarTemaBodySchema.partial();

export type AtualizarTemaBody = z.infer<typeof atualizarTemaBodySchema>;
