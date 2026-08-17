import { z } from "zod";

// RF01 - Login sem senha: identifica o jogador por nome + telefone + email.
export const loginBodySchema = z.object({
  nome: z.string().trim().min(1, "nome e obrigatorio"),
  telefone: z.string().trim().min(1, "telefone e obrigatorio"),
  email: z.string().trim().email("email invalido"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
