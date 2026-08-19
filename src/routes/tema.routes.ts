import { Router } from "express";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import { uploadTemaImagens } from "../middlewares/upload.middleware";
import * as temaController from "../controllers/tema.controller";

export const temaRouter = Router();

temaRouter.get("/temas", temaController.listarTemas);
temaRouter.get("/temas/:id", temaController.obterTema);
temaRouter.get("/temas/:id/icone", temaController.obterIconeTema);
temaRouter.get("/temas/:id/fundo", temaController.obterFundoTema);
temaRouter.post("/temas", requireAuth, requireAdmin, uploadTemaImagens, temaController.criarTema);
temaRouter.put(
  "/temas/:id",
  requireAuth,
  requireAdmin,
  uploadTemaImagens,
  temaController.atualizarTema
);
temaRouter.delete("/temas/:id", requireAuth, requireAdmin, temaController.excluirTema);
