import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env";

export type TokenPayload = { usuarioId: number; role: Role };

// O token confirma tanto a identidade quanto o papel (JOGADOR/ADM) no
// momento do login/registro — requireAdmin le o role direto daqui, sem
// bater no banco a cada request. Trade-off: mudar o role de alguem so
// reflete depois de um novo login.
export function signToken(usuarioId: number, role: Role): string {
  return jwt.sign({ usuarioId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof payload === "string" ||
    typeof payload.usuarioId !== "number" ||
    (payload.role !== "JOGADOR" && payload.role !== "ADM")
  ) {
    throw new Error("Token com formato inesperado");
  }
  return { usuarioId: payload.usuarioId, role: payload.role };
}
