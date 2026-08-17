import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

function extrairToken(req: Request): { presente: boolean; token?: string } {
  const header = req.headers.authorization;
  if (!header) return { presente: false };
  const [esquema, token] = header.split(" ");
  if (esquema !== "Bearer" || !token) return { presente: true, token: undefined };
  return { presente: true, token };
}

// Exige um token valido. Usado em rotas que so fazem sentido pra um usuario
// identificado (CRUD de temas/requisitos, /usuarios/me/*).
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { token } = extrairToken(req);

  if (!token) {
    return res.status(401).json({ erro: "Token ausente ou mal formatado" });
  }

  try {
    req.usuarioId = verifyToken(token).usuarioId;
    return next();
  } catch {
    return res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}

// Nao exige token, mas se vier um, ele precisa ser valido — evita mascarar um
// token expirado/quebrado como "usuario decidiu jogar anonimo". Usado em
// POST /partidas, que aceita tanto jogador logado quanto anonimo.
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const { presente, token } = extrairToken(req);

  if (!presente) return next();

  if (!token) {
    return res.status(401).json({ erro: "Token mal formatado" });
  }

  try {
    req.usuarioId = verifyToken(token).usuarioId;
    return next();
  } catch {
    return res.status(401).json({ erro: "Token invalido ou expirado" });
  }
}
