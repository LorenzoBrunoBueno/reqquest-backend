import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { requisitoRouter } from "./routes/requisito.routes";
import { authRouter } from "./routes/auth.routes";
import { temaRouter } from "./routes/tema.routes";
import { partidaRouter } from "./routes/partida.routes";
import { usuarioRouter } from "./routes/usuario.routes";

// App do Express separado do "listen" para poder ser importado
// diretamente nos testes (via supertest) sem precisar subir uma porta real.
export const app = express();

// Sem isso, o navegador bloqueia toda chamada fetch feita pelo frontend (rodando
// em outra origem/porta) antes mesmo de ela chegar nas rotas abaixo.
const origensPermitidas = env.FRONTEND_URL.split(",").map((origem) => origem.trim());
app.use(cors({ origin: origensPermitidas, credentials: true }));

app.use(express.json());

app.use(healthRouter);
app.use(requisitoRouter);
app.use(authRouter);
app.use(temaRouter);
app.use(partidaRouter);
app.use(usuarioRouter);
