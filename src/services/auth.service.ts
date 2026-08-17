import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import type { LoginBody } from "../schemas/auth.schema";

export type LoginResult = {
  token: string;
  usuario: { id: number; nome: string; telefone: string; email: string };
};

// RF01 - Login sem senha: busca o usuario pela identidade (nome+telefone+email)
// e cria um novo, com progresso zerado, se for a primeira vez que essa pessoa
// aparece. Sem senha pra validar — o token so confirma a identidade encontrada.
export async function login(dados: LoginBody): Promise<LoginResult> {
  const existente = await prisma.usuario.findUnique({
    where: { uq_usuarios_identidade: dados },
  });

  const usuario =
    existente ??
    (await prisma.$transaction(async (tx) => {
      const criado = await tx.usuario.create({ data: dados });
      await tx.progressoJogador.create({
        data: { usuarioId: criado.id, xp: 0 },
      });
      return criado;
    }));

  return {
    token: signToken(usuario.id),
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      telefone: usuario.telefone,
      email: usuario.email,
    },
  };
}
