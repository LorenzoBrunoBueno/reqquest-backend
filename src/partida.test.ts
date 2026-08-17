import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { temaUnico, usuarioUnico } from "./test/helpers";

describe("recurso /partidas", () => {
  let token: string;
  let usuarioId: number;
  let temaId: string;

  beforeAll(async () => {
    const login = await request(app).post("/auth/login").send(usuarioUnico());
    token = login.body.token;
    usuarioId = login.body.usuario.id;

    const tema = temaUnico();
    await prisma.tema.create({ data: tema });
    temaId = tema.id;
  });

  afterAll(async () => {
    await prisma.badgeDesbloqueado.deleteMany({ where: { usuarioId } });
    await prisma.partida.deleteMany({ where: { temaId } });
    await prisma.progressoJogador.deleteMany({ where: { usuarioId } });
    await prisma.tema.delete({ where: { id: temaId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("sem token grava usuarioNome Anonimo e nao gera progresso", async () => {
    const response = await request(app)
      .post("/partidas")
      .send({ temaId, score: 20, acertos: 2, erros: 1, nivel: 1 });

    expect(response.status).toBe(201);
    expect(response.body.partida.usuarioId).toBeNull();
    expect(response.body.partida.usuarioNome).toBe("Anônimo");
    expect(response.body.progresso).toBeNull();
    expect(response.body.badgesNovas).toEqual([]);
  });

  it("temaId inexistente retorna 400", async () => {
    const response = await request(app)
      .post("/partidas")
      .send({ temaId: "nao-existe", score: 0, acertos: 0, erros: 0, nivel: 1 });

    expect(response.status).toBe(400);
  });

  it("com token soma XP, sinaliza level-up e desbloqueia badges", async () => {
    const response = await request(app)
      .post("/partidas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temaId,
        score: 100,
        acertos: 10,
        erros: 0,
        nivel: 1,
        maiorSequencia: 5,
        respostasRapidas: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.progresso).toEqual({ xp: 100, level: 2, leveledUp: true });
    expect(response.body.badgesNovas.sort()).toEqual(
      ["perfeccionista", "primeira-vitoria", "sequencia-fogo", "speedrunner"].sort()
    );
  });

  it("repetir a mesma partida nao desbloqueia os mesmos badges de novo", async () => {
    const response = await request(app)
      .post("/partidas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temaId,
        score: 100,
        acertos: 10,
        erros: 0,
        nivel: 1,
        maiorSequencia: 5,
        respostasRapidas: 5,
      });

    expect(response.body.badgesNovas).toEqual([]);
    expect(response.body.progresso.xp).toBe(200);
  });

  it("GET /partidas filtra por temaId", async () => {
    const response = await request(app).get(`/partidas?temaId=${temaId}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body.every((p: { temaId: string }) => p.temaId === temaId)).toBe(true);
  });
});
