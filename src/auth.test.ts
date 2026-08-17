import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { verifyToken } from "./lib/jwt";
import { usuarioUnico } from "./test/helpers";

describe("POST /auth/login", () => {
  const criados: number[] = [];

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: criados } } });
    await prisma.$disconnect();
  });

  it("cria um usuario novo com progresso zerado", async () => {
    const dados = usuarioUnico();

    const response = await request(app).post("/auth/login").send(dados);

    expect(response.status).toBe(200);
    expect(response.body.usuario).toMatchObject(dados);
    expect(typeof response.body.token).toBe("string");
    criados.push(response.body.usuario.id);

    const progresso = await prisma.progressoJogador.findUnique({
      where: { usuarioId: response.body.usuario.id },
    });
    expect(progresso?.xp).toBe(0);
  });

  it("reaproveita o mesmo usuario ao logar de novo com a mesma identidade", async () => {
    const dados = usuarioUnico();

    const primeiro = await request(app).post("/auth/login").send(dados);
    criados.push(primeiro.body.usuario.id);
    const segundo = await request(app).post("/auth/login").send(dados);

    expect(segundo.body.usuario.id).toBe(primeiro.body.usuario.id);

    const total = await prisma.usuario.count({
      where: { nome: dados.nome, telefone: dados.telefone, email: dados.email },
    });
    expect(total).toBe(1);
  });

  it("o token emitido decodifica de volta o usuarioId certo", async () => {
    const dados = usuarioUnico();
    const response = await request(app).post("/auth/login").send(dados);
    criados.push(response.body.usuario.id);

    const payload = verifyToken(response.body.token);
    expect(payload.usuarioId).toBe(response.body.usuario.id);
  });

  it("rejeita corpo invalido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ nome: "", telefone: "", email: "nao-e-email" });

    expect(response.status).toBe(400);
  });
});
