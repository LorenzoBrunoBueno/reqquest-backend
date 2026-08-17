import { avaliarBadges } from "./badge.service";

const statsBase = {
  totalPartidas: 0,
  acertos: 0,
  erros: 0,
  respostasRapidas: 0,
  maiorSequencia: 0,
};

describe("avaliarBadges", () => {
  it("desbloqueia primeira-vitoria na primeira partida", () => {
    const novas = avaliarBadges({ ...statsBase, totalPartidas: 1 }, []);
    expect(novas).toContain("primeira-vitoria");
  });

  it("desbloqueia perfeccionista com 5+ acertos e 0 erros", () => {
    const novas = avaliarBadges({ ...statsBase, acertos: 5, erros: 0 }, []);
    expect(novas).toContain("perfeccionista");
  });

  it("nao desbloqueia perfeccionista se houver algum erro", () => {
    const novas = avaliarBadges({ ...statsBase, acertos: 5, erros: 1 }, []);
    expect(novas).not.toContain("perfeccionista");
  });

  it("desbloqueia speedrunner e sequencia-fogo nos limiares certos", () => {
    const novas = avaliarBadges(
      { ...statsBase, respostasRapidas: 5, maiorSequencia: 5 },
      []
    );
    expect(novas).toEqual(expect.arrayContaining(["speedrunner", "sequencia-fogo"]));
  });

  it("nao repete badges ja desbloqueadas", () => {
    const novas = avaliarBadges(
      { ...statsBase, totalPartidas: 5, acertos: 5, erros: 0 },
      ["primeira-vitoria", "perfeccionista"]
    );
    expect(novas).toEqual([]);
  });
});
