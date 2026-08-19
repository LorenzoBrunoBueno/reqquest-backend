import { z } from "zod";

const senhaSchema = z
  .string()
  .min(8, "senha deve ter no minimo 8 caracteres");

// Usado pela tela de login pra decidir, apos nome+telefone+email, se abre o
// modal de "criar senha" (primeiro acesso) ou "digitar senha" (recorrente).
export const verificarEmailBodySchema = z.object({
  email: z.string().trim().email("email invalido"),
});

export const registrarBodySchema = z.object({
  nome: z.string().trim().min(1, "nome e obrigatorio"),
  telefone: z.string().trim().min(1, "telefone e obrigatorio"),
  email: z.string().trim().email("email invalido"),
  senha: senhaSchema,
});

// email passa a ser a chave de acesso; nome/telefone digitados de novo na
// tela inicial nao entram aqui (nao precisam bater com o que ja esta salvo).
export const loginBodySchema = z.object({
  email: z.string().trim().email("email invalido"),
  senha: senhaSchema,
});

export type VerificarEmailBody = z.infer<typeof verificarEmailBodySchema>;
export type RegistrarBody = z.infer<typeof registrarBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
