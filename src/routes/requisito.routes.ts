import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import * as requisitoController from "../controllers/requisito.controller";

export const requisitoRouter = Router();

requisitoRouter.post("/requisitos/gerar", requisitoController.gerarRequisito);

requisitoRouter.get("/requisitos", requisitoController.listarRequisitos);
requisitoRouter.get("/requisitos/:id", requisitoController.obterRequisito);
requisitoRouter.post("/requisitos", requireAuth, requisitoController.criarRequisito);
requisitoRouter.put("/requisitos/:id", requireAuth, requisitoController.atualizarRequisito);
requisitoRouter.delete("/requisitos/:id", requireAuth, requisitoController.excluirRequisito);
