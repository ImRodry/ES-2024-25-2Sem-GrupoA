import { test, suite } from "node:test";
import assert from "node:assert";
import { averageAreaWithAdjacency } from "../src/calculations.ts";
import type { Property } from "../src/importer.ts";

suite("averageAreaWithAdjacency tests", () => {
  const sampleProperties: Property[] = [
    {
      objectId: 1,
      parId: 101,
      parNum: 1001,
      shapeLength: 20,
      shapeArea: 100,
      geometry: [[0, 0]],
      owner: 1,
      freguesia: "A",
      municipio: "M1",
      ilha: "I2",
    },
    {
      objectId: 2,
      parId: 102,
      parNum: 1002,
      shapeLength: 25,
      shapeArea: 400,
      geometry: [[1, 1]],
      owner: 1,
      freguesia: "A",
      municipio: "M2",
      ilha: "I1",
    },
    {
      objectId: 3,
      parId: 103,
      parNum: 1003,
      shapeLength: 30,
      shapeArea: 200,
      geometry: [[2, 2]],
      owner: 2,
      freguesia: "B",
      municipio: "M2",
      ilha: "I2",
    },
  ];

  // grafo manual de adjacência: 1 e 2 são adjacentes; 3 não tem vizinhos
  const adjacencyGraph = new Map<number, Set<number>>([
    [1, new Set([2])],
    [2, new Set([1])],
    [3, new Set<number>()],
  ]);

  test("unir propriedades adjacentes do mesmo proprietário e mesma freguesia", () => {
    const result = averageAreaWithAdjacency(sampleProperties, adjacencyGraph, "freguesia");
    // 1 e 2 unem-se: área total = 100 + 400 = 500, count = 1 → média = 500
    // 3 permanece isolada em B → média = 200
    assert.deepStrictEqual(result, {
      A: 500,
      B: 200,
    });
  });

  test("não unir quando dão proprietários diferentes", () => {
    // alterar owner da 2 para 2, de modo a não coincidir com o de 1
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, owner: 2 } : p
    );
    const result = averageAreaWithAdjacency(props, adjacencyGraph, "freguesia");
    // sem merge, equivale a averageArea
    assert.deepStrictEqual(result, {
      A: (100 + 400) / 2, // 250
      B: 200,
    });
  });

  test("não unir quando são freguesias diferentes", () => {
    // alterar freguesia da 2 para "B", mantendo owner igual a 1
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, freguesia: "B" } : p
    );
    const result = averageAreaWithAdjacency(props, adjacencyGraph, "freguesia");
    // sem merge em A (apenas 1) → média = 100; em B duas propriedades (400 + 200)/2 = 300
    assert.deepStrictEqual(result, {
      A: 100,
      B: 300,
    });
  });

  test("lista vazia retorna objeto vazio", () => {
    const result = averageAreaWithAdjacency([], new Map(), "municipio");
    assert.deepStrictEqual(result, {});
  });

  test("nenhuma propriedade adjacente", () => {
    const noAdjacencyGraph = new Map<number, Set<number>>([
      [1, new Set<number>()],
      [2, new Set<number>()],
      [3, new Set<number>()],
    ]);
    const result = averageAreaWithAdjacency(sampleProperties, noAdjacencyGraph, "freguesia");
    // sem merge, equivale a averageArea
    assert.deepStrictEqual(result, {
      A: (100 + 400) / 2, // 250
      B: 200,
    });
  });

  test("propriedade com múltiplos vizinhos", () => {
    const multiAdjacencyGraph = new Map<number, Set<number>>([
      [1, new Set([2, 3])],
      [2, new Set([1, 3])],
      [3, new Set([1, 2])],
    ]);
    const props = sampleProperties.map(p =>
      p.objectId === 3 ? { ...p, owner: 1, freguesia: "A" } : p
    );
    const result = averageAreaWithAdjacency(props, multiAdjacencyGraph, "freguesia");
    // 1, 2 e 3 unem-se: área total = 100 + 400 + 200 = 700, count = 1 → média = 700
    assert.deepStrictEqual(result, {
      A: 700,
    });
  });

  test("propriedades adjacentes com regiões diferentes", () => {
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, freguesia: "B" } : p
    );
    const result = averageAreaWithAdjacency(props, adjacencyGraph, "freguesia");
    // sem merge em A (apenas 1) → média = 100; em B duas propriedades (400 + 200)/2 = 300
    assert.deepStrictEqual(result, {
      A: 100,
      B: 300,
    });
  });

  test("propriedades adjacentes com donos diferentes", () => {
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, owner: 2 } : p
    );
    const result = averageAreaWithAdjacency(props, adjacencyGraph, "freguesia");
    // sem merge, equivale a averageArea
    assert.deepStrictEqual(result, {
      A: (100 + 400) / 2, // 250
      B: 200,
    });
  });

  test("grafo de adjacência vazio", () => {
    const emptyGraph = new Map<number, Set<number>>();
    const result = averageAreaWithAdjacency(sampleProperties, emptyGraph, "freguesia");
    // sem merge, equivale a averageArea
    assert.deepStrictEqual(result, {
      A: (100 + 400) / 2, // 250
      B: 200,
    });
  });
});
