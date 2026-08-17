import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { temaUnico, usuarioUnico } from "./test/helpers";

describe("recurso /requisitos", () => {
  let token: string;
  let usuarioId: number;
  let temaId: string;
  const requisitosCriados: string[] = [];

  beforeAll(async () => {
    const login = await request(app).post("/auth/login").send(usuarioUnico());
    token = login.body.token;
    usuarioId = login.body.usuario.id;

    const tema = temaUnico();
    await prisma.tema.create({ data: tema });
    temaId = tema.id;

    await prisma.requisito.createMany({
      data: [
        { id: `${temaId}-f1`, temaId, texto: "Requisito funcional de teste", tipo: "FUNCIONAL" },
        {
          id: `${temaId}-nf1`,
          temaId,
          texto: "Requisito nao funcional de teste",
          tipo: "NAO_FUNCIONAL",
        },
      ],
    });
    requisitosCriados.push(`${temaId}-f1`, `${temaId}-nf1`);
  });

  afterAll(async () => {
    await prisma.requisito.deleteMany({ where: { temaId } });
    await prisma.tema.delete({ where: { id: temaId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("GET /requisitos filtra por temaId e devolve tipo em formato wire", async () => {
    const response = await request(app).get(`/requisitos?temaId=${temaId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    const tipos = response.body.map((r: { tipo: string }) => r.tipo);
    expect(tipos.sort()).toEqual(["funcional", "nao-funcional"]);
    expect(tipos).not.toContain("FUNCIONAL");
    expect(tipos).not.toContain("NAO_FUNCIONAL");
  });

  it("GET /requisitos filtra por tipo e por texto", async () => {
    const porTipo = await request(app).get(`/requisitos?temaId=${temaId}&tipo=funcional`);
    expect(porTipo.body).toHaveLength(1);
    expect(porTipo.body[0].tipo).toBe("funcional");

    const porTexto = await request(app).get(
      `/requisitos?temaId=${temaId}&texto=${encodeURIComponent("nao funcional")}`
    );
    expect(porTexto.body).toHaveLength(1);
    expect(porTexto.body[0].tipo).toBe("nao-funcional");
  });

  it("POST /requisitos com temaId inexistente retorna 400", async () => {
    const response = await request(app)
      .post("/requisitos")
      .set("Authorization", `Bearer ${token}`)
      .send({ temaId: "nao-existe", texto: "x", tipo: "funcional" });

    expect(response.status).toBe(400);
  });

  it("POST /requisitos cria e devolve tipo wire correto", async () => {
    const response = await request(app)
      .post("/requisitos")
      .set("Authorization", `Bearer ${token}`)
      .send({ temaId, texto: "Novo requisito", tipo: "nao-funcional" });

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe("nao-funcional");
    requisitosCriados.push(response.body.id);
  });

  it("POST /requisitos/gerar continua respondendo o mock (regressao)", async () => {
    const response = await request(app)
      .post("/requisitos/gerar")
      .send({ tema: "Sistema de Teste", quantidade: 2 });

    expect(response.status).toBe(200);
    expect(response.body.mock).toBe(true);
    expect(response.body.requisitos).toHaveLength(2);
  });
});
