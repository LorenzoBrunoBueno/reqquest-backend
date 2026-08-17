import type { Request, Response } from "express";

// GET /health — usado para checar rapidamente se o servidor esta de pe.
export function healthCheck(_req: Request, res: Response) {
  return res.status(200).json({ status: "ok" });
}
