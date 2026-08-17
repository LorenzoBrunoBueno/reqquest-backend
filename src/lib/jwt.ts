import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = { usuarioId: number };

// Login e sem senha (RF01) — este token so confirma a identidade encontrada/
// criada em POST /auth/login, nao substitui autenticacao por senha.
export function signToken(usuarioId: number): string {
  return jwt.sign({ usuarioId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === "string" || typeof payload.usuarioId !== "number") {
    throw new Error("Token com formato inesperado");
  }
  return { usuarioId: payload.usuarioId };
}
