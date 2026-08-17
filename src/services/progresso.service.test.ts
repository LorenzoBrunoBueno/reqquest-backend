import { calcularNivel, calcularXpGanho, XP_PER_LEVEL } from "./progresso.service";

describe("calcularNivel", () => {
  it("nivel 1 para xp entre 0 e 99", () => {
    expect(calcularNivel(0)).toBe(1);
    expect(calcularNivel(99)).toBe(1);
  });

  it("sobe de nivel a cada XP_PER_LEVEL", () => {
    expect(calcularNivel(XP_PER_LEVEL)).toBe(2);
    expect(calcularNivel(XP_PER_LEVEL * 2)).toBe(3);
  });

  it("trata xp negativo como zero", () => {
    expect(calcularNivel(-50)).toBe(1);
  });
});

describe("calcularXpGanho", () => {
  it("10 xp por acerto", () => {
    expect(calcularXpGanho({ acertos: 3 })).toBe(30);
  });

  it("bonus de 20 xp quando o baralho foi completado", () => {
    expect(calcularXpGanho({ acertos: 3, deckCompleto: true })).toBe(50);
  });
});
