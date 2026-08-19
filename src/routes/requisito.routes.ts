import { Router } from "express";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
import * as requisitoController from "../controllers/requisito.controller";

export const requisitoRouter = Router();

requisitoRouter.post("/requisitos/gerar", requisitoController.gerarRequisito);

requisitoRouter.get("/requisitos", requisitoController.listarRequisitos);
requisitoRouter.get("/requisitos/:id", requisitoController.obterRequisito);
requisitoRouter.post(
  "/requisitos",
  requireAuth,
  requireAdmin,
  requisitoController.criarRequisito
);
requisitoRouter.put(
  "/requisitos/:id",
  requireAuth,
  requireAdmin,
  requisitoController.atualizarRequisito
);
requisitoRouter.delete(
  "/requisitos/:id",
  requireAuth,
  requireAdmin,
  requisitoController.excluirRequisito
);
