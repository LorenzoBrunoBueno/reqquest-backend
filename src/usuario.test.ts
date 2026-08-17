import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { temaUnico, usuarioUnico } from "./test/helpers";

describe("recurso /usuarios/me", () => {
  let tokenA: string;
  let usuarioIdA: number;
  let tokenB: string;
  let usuarioIdB: number;
  let temaId: string;

  beforeAll(async () => {
    const loginA = await request(app).post("/auth/login").send(usuarioUnico());
    tokenA = loginA.body.token;
    usuarioIdA = loginA.body.usuario.id;

    const loginB = await request(app).post("/auth/login").send(usuarioUnico());
    tokenB = loginB.body.token;
    usuarioIdB = loginB.body.usuario.id;

    const tema = temaUnico();
    await prisma.tema.create({ data: tema });
    temaId = tema.id;

    const jogada = { temaId, score: 100, acertos: 10, erros: 0, nivel: 1 };
    await request(app).post("/partidas").set("Authorization", `Bearer ${tokenA}`).send(jogada);
    await request(app).post("/partidas").set("Authorization", `Bearer ${tokenB}`).send(jogada);
  });

  afterAll(async () => {
    await prisma.badgeDesbloqueado.deleteMany({ where: { usuarioId: { in: [usuarioIdA, usuarioIdB] } } });
    await prisma.partida.deleteMany({ where: { temaId } });
    await prisma.progressoJogador.deleteMany({ where: { usuarioId: { in: [usuarioIdA, usuarioIdB] } } });
    await prisma.tema.delete({ where: { id: temaId } });
    await prisma.usuario.deleteMany({ where: { id: { in: [usuarioIdA, usuarioIdB] } } });
    await prisma.$disconnect();
  });

  it("rotas /usuarios/me/* sem token retornam 401", async () => {
    const respostas = await Promise.all([
      request(app).get("/usuarios/me"),
      request(app).get("/usuarios/me/progresso"),
      request(app).get("/usuarios/me/partidas"),
      request(app).post("/usuarios/me/reset"),
    ]);

    respostas.forEach((r) => expect(r.status).toBe(401));
  });

  it("GET /usuarios/me/progresso reflete o xp/badges acumulados", async () => {
    const response = await request(app)
      .get("/usuarios/me/progresso")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(response.body.xp).toBe(100);
    expect(response.body.badges).toContain("primeira-vitoria");
  });

  it("POST /usuarios/me/reset zera xp/partidas/badges so do usuario logado", async () => {
    const reset = await request(app)
      .post("/usuarios/me/reset")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(reset.status).toBe(200);
    expect(reset.body).toEqual({ xp: 0, badges: [] });

    const progressoA = await request(app)
      .get("/usuarios/me/progresso")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(progressoA.body).toEqual({ xp: 0, badges: [] });

    const partidasA = await request(app)
      .get("/usuarios/me/partidas")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(partidasA.body).toEqual([]);

    // Usuario B nao foi afetado pelo reset de A.
    const progressoB = await request(app)
      .get("/usuarios/me/progresso")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(progressoB.body.xp).toBe(100);
    expect(progressoB.body.badges).toContain("primeira-vitoria");

    const partidasB = await request(app)
      .get("/usuarios/me/partidas")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(partidasB.body).toHaveLength(1);
  });
});
