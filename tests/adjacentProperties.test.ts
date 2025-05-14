import { test, suite } from "node:test";
import assert from "node:assert";
import { mergeAdjacentProperties } from "../src/calculations.ts";
import type { Property } from "../src/importer.ts";

suite("mergeAdjacentProperties tests", () => {
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

  const adjacencyGraph = new Map<number, Set<number>>([
    [1, new Set([2])],
    [2, new Set([1])],
    [3, new Set<number>()],
  ]);

  test("should merge adjacent properties with same owner and region", () => {
    const result = mergeAdjacentProperties(sampleProperties, adjacencyGraph, "freguesia");
    assert.deepStrictEqual(result, [
      {
        objectId: 1,
        parId: 101,
        parNum: 1001,
        shapeLength: 20,
        shapeArea: 500,
        geometry: [[0, 0], [1, 1]],
        owner: 1,
        freguesia: "A",
        municipio: "M1",
        ilha: "I2",
      },
      sampleProperties[2],
    ]);
  });

  test("should not merge when owners differ", () => {
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, owner: 2 } : p
    );
    const result = mergeAdjacentProperties(props, adjacencyGraph, "freguesia");
    assert.deepStrictEqual(result, props);
  });

  test("should not merge when regions differ", () => {
    const props = sampleProperties.map(p =>
      p.objectId === 2 ? { ...p, freguesia: "B" } : p
    );
    const result = mergeAdjacentProperties(props, adjacencyGraph, "freguesia");
    assert.deepStrictEqual(result, props);
  });

  test("empty input returns empty array", () => {
    const result = mergeAdjacentProperties([], new Map(), "municipio");
    assert.deepStrictEqual(result, []);
  });

  test("no adjacency returns original properties", () => {
    const noAdj = new Map<number, Set<number>>([
      [1, new Set<number>()],
      [2, new Set<number>()],
      [3, new Set<number>()],
    ]);
    const result = mergeAdjacentProperties(sampleProperties, noAdj, "freguesia");
    assert.deepStrictEqual(result, sampleProperties);
  });

  test("should merge multiple neighbors into one group", () => {
    const multiAdj = new Map<number, Set<number>>([
      [1, new Set([2, 3])],
      [2, new Set([1, 3])],
      [3, new Set([1, 2])],
    ]);
    const props = sampleProperties.map(p =>
      p.objectId === 3 ? { ...p, owner: 1, freguesia: "A" } : p
    );
    const result = mergeAdjacentProperties(props, multiAdj, "freguesia");
    assert.deepStrictEqual(result, [
      {
        objectId: 1,
        parId: 101,
        parNum: 1001,
        shapeLength: 20,
        shapeArea: 700,
        geometry: [[0, 0], [2, 2], [1, 1]],
        owner: 1,
        freguesia: "A",
        municipio: "M1",
        ilha: "I2",
      },
    ]);
  });

  test("empty adjacency graph returns original properties", () => {
    const result = mergeAdjacentProperties(sampleProperties, new Map(), "freguesia");
    assert.deepStrictEqual(result, sampleProperties);
  });
});
