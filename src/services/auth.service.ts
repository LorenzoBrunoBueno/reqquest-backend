import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { env } from "../config/env";
import type { LoginBody, RegistrarBody } from "../schemas/auth.schema";

export type UsuarioPublico = {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  role: "JOGADOR" | "ADM";
};

export type AuthResult = { token: string; usuario: UsuarioPublico };

function paraUsuarioPublico(usuario: {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  role: "JOGADOR" | "ADM";
}): UsuarioPublico {
  return {
    id: usuario.id,
    nome: usuario.nome,
    telefone: usuario.telefone,
    email: usuario.email,
    role: usuario.role,
  };
}

// Decide qual modal a tela de login abre: "crie sua senha" (email novo) ou
// "digite sua senha" (email ja cadastrado).
export async function verificarEmail(email: string): Promise<{ cadastrado: boolean }> {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  return { cadastrado: usuario !== null };
}

// Primeiro acesso: cria a conta com senha hasheada + progresso zerado.
// Retorna null se o email ja estiver cadastrado, pro controller decidir o 409.
export async function registrar(dados: RegistrarBody): Promise<AuthResult | null> {
  const existente = await prisma.usuario.findUnique({ where: { email: dados.email } });
  if (existente) return null;

  const senhaHash = await bcrypt.hash(dados.senha, env.BCRYPT_SALT_ROUNDS);

  const usuario = await prisma.$transaction(async (tx) => {
    const criado = await tx.usuario.create({
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        senhaHash,
      },
    });
    await tx.progressoJogador.create({ data: { usuarioId: criado.id, xp: 0 } });
    return criado;
  });

  return {
    token: signToken(usuario.id, usuario.role),
    usuario: paraUsuarioPublico(usuario),
  };
}

// Acesso recorrente: email + senha sao a credencial. Retorna null tanto pra
// email inexistente quanto pra senha errada — o controller devolve sempre o
// mesmo 401 generico, pra nao vazar qual campo esta incorreto.
export async function login(dados: LoginBody): Promise<AuthResult | null> {
  const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
  const credenciaisValidas =
    usuario !== null && (await bcrypt.compare(dados.senha, usuario.senhaHash));

  if (!usuario || !credenciaisValidas) return null;

  return {
    token: signToken(usuario.id, usuario.role),
    usuario: paraUsuarioPublico(usuario),
  };
}
