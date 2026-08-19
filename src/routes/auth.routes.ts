import { Router } from "express";
import {
  loginController,
  registrarController,
  verificarEmailController,
} from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/auth/verificar-email", verificarEmailController);
authRouter.post("/auth/registrar", registrarController);
authRouter.post("/auth/login", loginController);
