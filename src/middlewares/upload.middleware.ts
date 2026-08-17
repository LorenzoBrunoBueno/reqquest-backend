import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const TIPOS_PERMITIDOS = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

const upload = multer({
  // Buffer em memoria -> grava direto nas colunas Bytes (icone_imagem/fundo_imagem),
  // sem passar por disco.
  storage: multer.memoryStorage(),
  limits: { fileSize: env.TEMA_IMAGEM_MAX_BYTES },
  fileFilter(_req, file, cb) {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      cb(new Error("Tipo de arquivo nao suportado. Use PNG, JPEG, WEBP ou SVG."));
      return;
    }
    cb(null, true);
  },
}).fields([
  { name: "iconeArquivo", maxCount: 1 },
  { name: "fundoArquivo", maxCount: 1 },
]);

// .fields() porque cada requisicao pode trazer dois arquivos independentes e
// opcionais (icone e fundo). Envolve o multer bruto so pra devolver erro no
// formato {erro} padrao do resto da API, em vez da pagina HTML de erro
// default do Express (nao ha middleware de erro global em app.ts).
export function uploadTemaImagens(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    const mensagem =
      err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
        ? `Arquivo excede o tamanho maximo de ${env.TEMA_IMAGEM_MAX_BYTES} bytes.`
        : err instanceof Error
          ? err.message
          : "Falha ao processar upload.";
    res.status(400).json({ erro: mensagem });
  });
}
