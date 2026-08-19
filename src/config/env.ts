import "dotenv/config";
import { z } from "zod";

// Valida e tipa as variaveis de ambiente logo na inicializacao da aplicacao.
// Se algo obrigatorio estiver faltando, o processo falha rapido (fail fast)
// em vez de quebrar mais tarde em algum lugar aleatorio do codigo.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL e obrigatoria"),
  GEMINI_API_KEY: z.string().optional().default(""),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(10, "JWT_SECRET e obrigatoria (minimo 10 caracteres)"),
  JWT_EXPIRES_IN: z.string().default("30d"),
  // Origem(ns) do frontend liberadas no CORS. Aceita uma lista separada por
  // virgula (util quando o frontend roda em mais de uma porta em dev).
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  // Tamanho maximo (em bytes) aceito por imagem enviada no cadastro de mundo
  // (icone/fundo). Padrao 2MB — ver middlewares/upload.middleware.ts.
  TEMA_IMAGEM_MAX_BYTES: z.coerce.number().int().positive().default(2 * 1024 * 1024),
  // Custo do hash bcrypt da senha (auth.service.ts). Padrao 10 — suficiente
  // pra um projeto de faculdade sem exigir hardware forte em dev.
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Variaveis de ambiente invalidas:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Falha ao carregar variaveis de ambiente. Confira o arquivo .env");
}

export const env = parsedEnv.data;
