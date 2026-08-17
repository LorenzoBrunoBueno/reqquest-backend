import request from "supertest";
import { app } from "./app";
import { prisma } from "./lib/prisma";
import { usuarioUnico } from "./test/helpers";

describe("recurso /temas", () => {
  let token: string;
  let usuarioId: number;
  const temasCriados: string[] = [];

  beforeAll(async () => {
    const login = await request(app).post("/auth/login").send(usuarioUnico());
    token = login.body.token;
    usuarioId = login.body.usuario.id;
  });

  afterAll(async () => {
    await prisma.tema.deleteMany({ where: { id: { in: temasCriados } } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("GET /temas funciona sem autenticacao e traz os mundos do seed", async () => {
    const response = await request(app).get("/temas");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((t: { id: string }) => t.id === "t-restaurante")).toBe(true);
  });

  it("POST /temas sem token retorna 401", async () => {
    const response = await request(app).post("/temas").send({ nome: "Mundo sem token" });
    expect(response.status).toBe(401);
  });

  it("POST /temas com token cria o mundo", async () => {
    const response = await request(app)
      .post("/temas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Mundo de Teste" });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe("Mundo de Teste");
    temasCriados.push(response.body.id);
  });

  it("DELETE /temas/:id cascateia para os requisitos do mundo", async () => {
    const tema = await request(app)
      .post("/temas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Mundo pra excluir" });
    temasCriados.push(tema.body.id);

    const requisito = await prisma.requisito.create({
      data: { temaId: tema.body.id, texto: "Requisito de teste", tipo: "FUNCIONAL" },
    });

    const delecao = await request(app)
      .delete(`/temas/${tema.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delecao.status).toBe(204);

    const requisitoAinda = await prisma.requisito.findUnique({ where: { id: requisito.id } });
    expect(requisitoAinda).toBeNull();
  });

  it("DELETE /temas/:id inexistente retorna 404", async () => {
    const response = await request(app)
      .delete("/temas/nao-existe")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
  });

  describe("upload de imagem (icone/fundo)", () => {
    // PNG 1x1 valido minimo, usado como arquivo de teste.
    const pngMinimo = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );

    it("POST /temas com iconeArquivo cria o mundo e serve a imagem em /temas/:id/icone", async () => {
      const criacao = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo com icone")
        .attach("iconeArquivo", pngMinimo, "icone.png");
      expect(criacao.status).toBe(201);
      temasCriados.push(criacao.body.id);
      expect(criacao.body.icone).toMatch(/^http:\/\//);
      expect(criacao.body.icone).toContain(`/temas/${criacao.body.id}/icone`);

      const imagem = await request(app).get(`/temas/${criacao.body.id}/icone`);
      expect(imagem.status).toBe(200);
      expect(imagem.headers["content-type"]).toBe("image/png");
      expect(Buffer.compare(imagem.body, pngMinimo)).toBe(0);
    });

    it("POST /temas com fundoArquivo serve a imagem em /temas/:id/fundo", async () => {
      const criacao = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo com fundo")
        .attach("fundoArquivo", pngMinimo, "fundo.png");
      expect(criacao.status).toBe(201);
      temasCriados.push(criacao.body.id);

      const imagem = await request(app).get(`/temas/${criacao.body.id}/fundo`);
      expect(imagem.status).toBe(200);
      expect(imagem.headers["content-type"]).toBe("image/png");
    });

    it("POST /temas multipart sem token retorna 401 antes de processar o arquivo", async () => {
      const response = await request(app)
        .post("/temas")
        .field("nome", "Mundo sem token com arquivo")
        .attach("iconeArquivo", pngMinimo, "icone.png");
      expect(response.status).toBe(401);
    });

    it("POST /temas com arquivo maior que o limite retorna 400", async () => {
      const arquivoGrande = Buffer.alloc(2 * 1024 * 1024 + 1);
      const response = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo com arquivo grande")
        .attach("iconeArquivo", arquivoGrande, { filename: "icone.png", contentType: "image/png" });
      expect(response.status).toBe(400);
      expect(response.body.erro).toMatch(/tamanho maximo/);
    });

    it("POST /temas com tipo de arquivo nao suportado retorna 400", async () => {
      const response = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo com arquivo invalido")
        .attach("iconeArquivo", Buffer.from("nao e uma imagem"), { filename: "arquivo.txt", contentType: "text/plain" });
      expect(response.status).toBe(400);
    });

    it("PUT /temas/:id sem novo arquivo mantem a imagem existente", async () => {
      const criacao = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo pra editar sem trocar imagem")
        .attach("iconeArquivo", pngMinimo, "icone.png");
      temasCriados.push(criacao.body.id);

      const edicao = await request(app)
        .put(`/temas/${criacao.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .field("descricao", "Descricao atualizada");
      expect(edicao.status).toBe(200);
      // Compara so o caminho (nao o host:porta) — cada `request(app)` do
      // supertest sobe o app numa porta efemera diferente, so o path importa.
      expect(new URL(edicao.body.icone).pathname).toBe(new URL(criacao.body.icone).pathname);
    });

    it("PUT /temas/:id com removerIcone=true reverte a imagem e o endpoint de streaming passa a 404", async () => {
      const criacao = await request(app)
        .post("/temas")
        .set("Authorization", `Bearer ${token}`)
        .field("nome", "Mundo pra remover imagem")
        .attach("iconeArquivo", pngMinimo, "icone.png");
      temasCriados.push(criacao.body.id);

      const edicao = await request(app)
        .put(`/temas/${criacao.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .field("removerIcone", "true");
      expect(edicao.status).toBe(200);
      expect(edicao.body.icone).toBeFalsy();

      const imagem = await request(app).get(`/temas/${criacao.body.id}/icone`);
      expect(imagem.status).toBe(404);
    });
  });
});
