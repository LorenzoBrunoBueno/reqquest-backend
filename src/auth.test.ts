import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { verifyToken } from "./lib/jwt";
import { usuarioUnico } from "./test/helpers";

describe("POST /auth/verificar-email", () => {
  const criados: number[] = [];

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: criados } } });
    await prisma.$disconnect();
  });

  it("retorna cadastrado=false pra email desconhecido", async () => {
    const response = await request(app)
      .post("/auth/verificar-email")
      .send({ email: `desconhecido-${Date.now()}@exemplo.com` });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ cadastrado: false });
  });

  it("retorna cadastrado=true depois do registro", async () => {
    const dados = usuarioUnico();
    const registro = await request(app).post("/auth/registrar").send(dados);
    criados.push(registro.body.usuario.id);

    const response = await request(app)
      .post("/auth/verificar-email")
      .send({ email: dados.email });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ cadastrado: true });
  });

  it("rejeita corpo invalido", async () => {
    const response = await request(app).post("/auth/verificar-email").send({ email: "nao-e-email" });
    expect(response.status).toBe(400);
  });
});

describe("POST /auth/registrar", () => {
  const criados: number[] = [];

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: criados } } });
    await prisma.$disconnect();
  });

  it("cria um usuario novo com progresso zerado e papel JOGADOR", async () => {
    const dados = usuarioUnico();

    const response = await request(app).post("/auth/registrar").send(dados);

    expect(response.status).toBe(201);
    expect(response.body.usuario).toMatchObject({
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
      role: "JOGADOR",
    });
    expect(response.body.usuario).not.toHaveProperty("senhaHash");
    expect(typeof response.body.token).toBe("string");
    criados.push(response.body.usuario.id);

    const progresso = await prisma.progressoJogador.findUnique({
      where: { usuarioId: response.body.usuario.id },
    });
    expect(progresso?.xp).toBe(0);
  });

  it("guarda a senha hasheada, nunca em texto puro", async () => {
    const dados = usuarioUnico();
    const response = await request(app).post("/auth/registrar").send(dados);
    criados.push(response.body.usuario.id);

    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
    expect(usuario?.senhaHash).not.toBe(dados.senha);
    expect(usuario?.senhaHash.startsWith("$2")).toBe(true);
  });

  it("o token emitido decodifica de volta o usuarioId e o role certos", async () => {
    const dados = usuarioUnico();
    const response = await request(app).post("/auth/registrar").send(dados);
    criados.push(response.body.usuario.id);

    const payload = verifyToken(response.body.token);
    expect(payload.usuarioId).toBe(response.body.usuario.id);
    expect(payload.role).toBe("JOGADOR");
  });

  it("rejeita registro com email ja cadastrado", async () => {
    const dados = usuarioUnico();
    const primeiro = await request(app).post("/auth/registrar").send(dados);
    criados.push(primeiro.body.usuario.id);

    const segundo = await request(app).post("/auth/registrar").send(usuarioUnico2(dados.email));

    expect(segundo.status).toBe(409);
  });

  it("rejeita corpo invalido (senha curta)", async () => {
    const dados = usuarioUnico();
    const response = await request(app)
      .post("/auth/registrar")
      .send({ ...dados, senha: "123" });

    expect(response.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  const criados: number[] = [];

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: criados } } });
    await prisma.$disconnect();
  });

  it("autentica com email + senha corretos", async () => {
    const dados = usuarioUnico();
    const registro = await request(app).post("/auth/registrar").send(dados);
    criados.push(registro.body.usuario.id);

    const login = await request(app)
      .post("/auth/login")
      .send({ email: dados.email, senha: dados.senha });

    expect(login.status).toBe(200);
    expect(login.body.usuario.id).toBe(registro.body.usuario.id);
    expect(typeof login.body.token).toBe("string");
  });

  it("rejeita senha errada com 401 generico", async () => {
    const dados = usuarioUnico();
    const registro = await request(app).post("/auth/registrar").send(dados);
    criados.push(registro.body.usuario.id);

    const login = await request(app)
      .post("/auth/login")
      .send({ email: dados.email, senha: "SenhaErrada123!" });

    expect(login.status).toBe(401);
  });

  it("rejeita email inexistente com o mesmo 401 generico", async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: `nao-existe-${Date.now()}@exemplo.com`, senha: "Senha123!" });

    expect(login.status).toBe(401);
  });

  it("rejeita corpo invalido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "nao-e-email", senha: "" });

    expect(response.status).toBe(400);
  });
});

function usuarioUnico2(emailExistente: string) {
  const base = usuarioUnico();
  return { ...base, email: emailExistente };
}
