import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as usuarioController from "../controllers/usuario.controller";

export const usuarioRouter = Router();

usuarioRouter.get("/usuarios/me", requireAuth, usuarioController.obterUsuarioLogado);
usuarioRouter.get("/usuarios/me/progresso", requireAuth, usuarioController.obterProgresso);
usuarioRouter.get("/usuarios/me/partidas", requireAuth, usuarioController.listarPartidasDoUsuario);
usuarioRouter.post("/usuarios/me/reset", requireAuth, usuarioController.resetarJornada);
