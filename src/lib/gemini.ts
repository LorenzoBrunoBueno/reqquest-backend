import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

// Cliente da Gemini API. A chamada real de geracao de requisitos ainda
// nao foi implementada (ver src/services/requisito.service.ts) — este
// cliente fica pronto para quando essa integracao for feita.
export const geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
