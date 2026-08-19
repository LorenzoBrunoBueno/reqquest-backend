import type { Request, Response } from "express";
import {
  loginBodySchema,
  registrarBodySchema,
  verificarEmailBodySchema,
} from "../schemas/auth.schema";
import * as authService from "../services/auth.service";

// POST /auth/verificar-email
export async function verificarEmailController(req: Request, res: Response) {
  const parsedBody = verificarEmailBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const resultado = await authService.verificarEmail(parsedBody.data.email);
  return res.status(200).json(resultado);
}

// POST /auth/registrar
export async function registrarController(req: Request, res: Response) {
  const parsedBody = registrarBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const resultado = await authService.registrar(parsedBody.data);
  if (!resultado) {
    return res.status(409).json({ erro: "Email ja cadastrado" });
  }
  return res.status(201).json(resultado);
}

// POST /auth/login
export async function loginController(req: Request, res: Response) {
  const parsedBody = loginBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const resultado = await authService.login(parsedBody.data);
  if (!resultado) {
    return res.status(401).json({ erro: "Credenciais invalidas" });
  }
  return res.status(200).json(resultado);
}
