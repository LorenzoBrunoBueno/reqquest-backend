import { Router } from "express";
import { optionalAuth } from "../middlewares/auth.middleware";
import * as partidaController from "../controllers/partida.controller";

export const partidaRouter = Router();

partidaRouter.post("/partidas", optionalAuth, partidaController.registrarPartida);
partidaRouter.get("/partidas", partidaController.listarPartidas);
