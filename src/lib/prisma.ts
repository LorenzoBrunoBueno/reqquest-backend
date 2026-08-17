import { PrismaClient } from "@prisma/client";

// Instancia unica do Prisma Client, compartilhada pela aplicacao inteira.
export const prisma = new PrismaClient();
