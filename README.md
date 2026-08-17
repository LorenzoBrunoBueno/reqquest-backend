# Backend — Jogo de Requisitos Funcionais e Não Funcionais

Backend de um jogo educativo sobre Tipos de Requisitos. O jogador escolhe um tema
(ex.: Sistema de Restaurante, Sistema de Escola) e arrasta requisitos até a caixa
correta — **Requisito Funcional** ou **Requisito Não Funcional**.

Este repositório contém **apenas o backend**. O frontend/jogo é responsabilidade
de outro integrante do grupo. O banco MySQL também é gerenciado por outro colega —
aqui usamos um MySQL descartável via Docker apenas para desenvolvimento local.

## Stack

- Node.js + TypeScript
- Express
- Prisma (ORM para MySQL)
- Zod (validação de entrada e da resposta da Gemini API)
- JWT (`jsonwebtoken`) para identificar o jogador logado — login é sem senha (RF01),
  o token só confirma a identidade encontrada/criada
- `cors`, liberando a origem do frontend (`FRONTEND_URL`) para chamadas via `fetch`
- Jest + Supertest (testes de integração contra o MySQL de dev)
- Docker + Docker Compose (ambiente de desenvolvimento local)

## Rodando o projeto do zero

### 1. Subir o MySQL de desenvolvimento

```bash
docker compose up -d
```

Isso sobe um container MySQL local (dados fictícios, descartáveis). O banco de
produção é hospedado separadamente e configurado só trocando a variável
`DATABASE_URL` — nunca usamos o `docker-compose.yml` em produção.

### 2. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e ajuste se necessário:

```bash
cp .env.example .env
```

`FRONTEND_URL` (default `http://localhost:5173`) controla o CORS — precisa
bater com a origem de onde o frontend React (`frontend/reqquest/`) está
rodando, senão o navegador bloqueia as chamadas `fetch` dele para esta API.

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar as migrations

```bash
npm run db:migrate
```

### 5. Popular o banco com dados fictícios

```bash
npm run db:seed
```

### 6. Subir o servidor em modo dev

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`. Teste com:

```bash
curl http://localhost:3000/health
```

## Rodando os testes

Os testes são de integração de verdade: rodam via supertest contra o app e usam o
Prisma para ler/escrever no MySQL de desenvolvimento (sem mockar nada). Por isso,
antes de `npm test`, o banco precisa estar de pé e migrado:

```bash
docker compose up -d
npm run db:migrate
npm test
```

Cada arquivo de teste cria seus próprios usuários/mundos com identidades únicas e
limpa exatamente o que criou em `afterAll` — o seed dos 6 mundos/96 requisitos não
é afetado.

## Outros scripts

- `npm run build` — compila o TypeScript para `dist/`.
- `npm start` — roda a versão compilada (`dist/server.js`), usada em produção.

## Estrutura de pastas

```
src/
  routes/       # Definição das rotas do Express
  controllers/  # Recebem a requisição, validam e chamam os services
  services/     # Regras de negócio (ex.: XP/nível, badges, geração de requisitos)
  schemas/      # Schemas Zod (validação de entrada e de dados da IA)
  lib/          # Clientes externos (Prisma, Gemini) e o wrapper de JWT
  middlewares/  # requireAuth / optionalAuth (autenticação via JWT)
  config/       # Variáveis de ambiente tipadas e validadas
  test/         # Helpers compartilhados pelos testes de integração
prisma/
  schema.prisma # Modelo do banco (ajustar com o colega responsável pelo banco)
  seed.ts       # Popula o banco de dev com os 6 mundos e 96 requisitos fictícios
```

## Autenticação

O login (`POST /auth/login`) não usa senha (RF01) — recebe `{nome, telefone, email}`,
busca ou cria o usuário com essa identidade e devolve um JWT. Esse token só confirma
a identidade encontrada/criada; ele deve ser enviado como
`Authorization: Bearer <token>` nas rotas que dependem de "quem está logado"
(CRUD de mundos/requisitos, `/usuarios/me/*`). `POST /partidas` aceita o token de
forma opcional: sem ele a partida é registrada como "Anônimo" (sem XP/badge); com
ele, soma XP e avalia conquistas para o usuário autenticado.

## Sobre a integração com a Gemini API

A rota `POST /requisitos/gerar` hoje retorna um **mock** (ver
`src/services/requisito.service.ts`). A chamada real à Gemini API ainda não foi
implementada — quando isso for feito, a resposta da IA deve ser validada com o
schema `respostaGeminiSchema` (`src/schemas/requisito.schema.ts`) antes de
qualquer inserção no banco.
