import type { Request, Response } from "express";
import { loginBodySchema } from "../schemas/auth.schema";
import { login } from "../services/auth.service";

// POST /auth/login
export async function loginController(req: Request, res: Response) {
  const parsedBody = loginBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      erro: "Corpo da requisicao invalido",
      detalhes: parsedBody.error.flatten().fieldErrors,
    });
  }

  const resultado = await login(parsedBody.data);

  return res.status(200).json(resultado);
}
