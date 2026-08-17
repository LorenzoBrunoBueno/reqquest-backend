# ---- Etapa 1: build ----
# Compila o TypeScript para JavaScript e gera o Prisma Client.
FROM node:20-alpine AS build

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Etapa 2: imagem final ----
# Imagem enxuta, so com o que e necessario para rodar em producao.
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
# --include=dev: prisma (CLI) e tsx sao devDependencies, mas o
# docker-entrypoint.sh precisa deles em runtime pra rodar
# "prisma migrate deploy" e o seed (tsx prisma/seed.ts).
RUN npm install --include=dev
RUN npx prisma generate

COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
