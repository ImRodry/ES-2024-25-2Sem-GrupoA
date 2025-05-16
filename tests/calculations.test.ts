import { test, suite } from "node:test"
import assert from "node:assert"
import { averageArea, extractExteriorRing, mergeAdjacentProperties } from "../src/calculations.ts"
import type { Property } from "./importer.ts"
import type { Feature, MultiPolygon } from "geojson"

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
		owner: 2,
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
		owner: 3,
		freguesia: "B",
		municipio: "M2",
		ilha: "I2",
	},
]

suite("Calculation tests", () => {
	test("averageArea: average by freguesia", () => {
		const result = averageArea(sampleProperties, "freguesia")
		assert.deepStrictEqual(result, {
			A: 250, // (100 + 400) / 2
			B: 200, // (200) / 1
		})
	})

	test("averageArea: average by municipio", () => {
		const result = averageArea(sampleProperties, "municipio")
		assert.deepStrictEqual(result, {
			M1: 100, // (100) / 1
			M2: 300, // (400 + 200) / 2
		})
	})

	test("averageArea: average by ilha", () => {
		const result = averageArea(sampleProperties, "ilha")
		assert.deepStrictEqual(result, {
			I1: 400, // (400) / 1
			I2: 150, // (100 + 200) / 2
		})
	})

	test("averageArea: all shape areas are zero", () => {
		const propsZero: Property[] = sampleProperties.map(p => ({ ...p, shapeArea: 0 }))
		const result = averageArea(propsZero, "freguesia")
		assert.deepStrictEqual(result, {
			A: 0,
			B: 0,
		})
	})

	test("averageArea: only one property in one region", () => {
		const props: Property[] = [sampleProperties[0]]
		const result = averageArea(props, "ilha")
		assert.deepStrictEqual(result, {
			I2: 100,
		})
	})

	test("averageArea: empty property list", () => {
		const result = averageArea([], "municipio")
		assert.deepStrictEqual(result, {})
	})

	test("averageArea: multiple unique regions with one property each", () => {
		const props: Property[] = [
			{ ...sampleProperties[0], freguesia: "X", shapeArea: 50 },
			{ ...sampleProperties[1], freguesia: "Y", shapeArea: 150 },
			{ ...sampleProperties[2], freguesia: "Z", shapeArea: 300 },
		]
		const result = averageArea(props, "freguesia")
		assert.deepStrictEqual(result, {
			X: 50,
			Y: 150,
			Z: 300,
		})
	})

	const sampleProperties: Property[] = [
		{
			objectId: 1,
			parId: 101,
			parNum: 1001,
			shapeLength: 20,
			shapeArea: 100,
			geometry: [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
				[0, 0],
			],
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
			geometry: [
				[1, 1],
				[2, 1],
				[2, 2],
				[1, 2],
				[1, 1],
			],
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
			geometry: [
				[2, 2],
				[3, 2],
				[3, 3],
				[2, 3],
				[2, 2],
			],
			owner: 2,
			freguesia: "B",
			municipio: "M2",
			ilha: "I2",
		},
	]

	const adjacencyGraph = new Map<number, Set<number>>([
		[1, new Set([2])],
		[2, new Set([1])],
		[3, new Set<number>()],
	])

	test("should merge adjacent properties with same owner and region", () => {
		const result = mergeAdjacentProperties(sampleProperties, adjacencyGraph, "freguesia")
		assert.deepStrictEqual(result[0].shapeArea, 500)
		assert.deepStrictEqual(result[0].geometry.length > 0, true) // Ensure geometry is valid
		assert.deepStrictEqual(result[1], sampleProperties[2]) // Ensure non-adjacent property remains unchanged
	})

	test("should not merge when owners differ", () => {
		const props = sampleProperties.map(p => (p.objectId === 2 ? { ...p, owner: 2 } : p))
		const result = mergeAdjacentProperties(props, adjacencyGraph, "freguesia")
		assert.deepStrictEqual(result, props)
	})

	test("should not merge when regions differ", () => {
		const props = sampleProperties.map(p => (p.objectId === 2 ? { ...p, freguesia: "B" } : p))
		const result = mergeAdjacentProperties(props, adjacencyGraph, "freguesia")
		assert.deepStrictEqual(result, props)
	})

	test("empty input returns empty array", () => {
		const result = mergeAdjacentProperties([], new Map(), "municipio")
		assert.deepStrictEqual(result, [])
	})

	test("no adjacency returns original properties", () => {
		const noAdj = new Map<number, Set<number>>([
			[1, new Set<number>()],
			[2, new Set<number>()],
			[3, new Set<number>()],
		])
		const result = mergeAdjacentProperties(sampleProperties, noAdj, "freguesia")
		assert.deepStrictEqual(result, sampleProperties)
	})

	test("should merge multiple neighbors into one group", () => {
		const multiAdj = new Map<number, Set<number>>([
			[1, new Set([2, 3])],
			[2, new Set([1, 3])],
			[3, new Set([1, 2])],
		])
		const props = sampleProperties.map(p => (p.objectId === 3 ? { ...p, owner: 1, freguesia: "A" } : p))
		const result = mergeAdjacentProperties(props, multiAdj, "freguesia")
		assert.deepStrictEqual(result[0].shapeArea, 700)
		assert.deepStrictEqual(result[0].geometry.length > 0, true) // Ensure geometry is valid
	})

	test("empty adjacency graph returns original properties", () => {
		const result = mergeAdjacentProperties(sampleProperties, new Map(), "freguesia")
		assert.deepStrictEqual(result, sampleProperties)
	})

	test("should handle union returning null", () => {
		const invalidProperties: Property[] = [
			{
				objectId: 1,
				parId: 101,
				parNum: 1001,
				shapeLength: 20,
				shapeArea: 100,
				geometry: [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0],
				],
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
				geometry: [
					[100, 100], // Geometria distante e não sobreposta
					[101, 100],
					[101, 101],
					[100, 101],
					[100, 100],
				],
				owner: 1,
				freguesia: "A",
				municipio: "M1",
				ilha: "I2",
			},
		]

		const adjacencyGraph = new Map<number, Set<number>>([
			[1, new Set([2])],
			[2, new Set([1])],
		])

		const result = mergeAdjacentProperties(invalidProperties, adjacencyGraph, "freguesia")
		assert.deepStrictEqual(result[0].shapeArea, 500) // Áreas ainda devem ser somadas
		assert.deepStrictEqual(result[0].geometry.length > 0, true) // Geometria original deve ser mantida
	})

	test("should close geometry when input is not closed", () => {
		const sample: Property[] = [
			{
				objectId: 1,
				parId: 1,
				parNum: 1,
				shapeLength: 10,
				shapeArea: 50,
				// sem repetir o primeiro ponto no fim
				geometry: [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
				],
				owner: 1,
				freguesia: "X",
				municipio: "M",
				ilha: "I",
			},
		]
		const graph = new Map<number, Set<number>>([[1, new Set()]])
		const result = mergeAdjacentProperties(sample, graph, "freguesia")
		const geom = result[0].geometry
		// deve ter fechado o anel (>=5 pontos e primeiro == último)
		assert.ok(geom.length >= 5)
		assert.deepStrictEqual(geom[0], geom[geom.length - 1])
	})

	test("should extract exterior ring from MultiPolygon fallback", () => {
		// Criamos manualmente um Feature que simula um MultiPolygon
		// mas neste caso, a função de merge vai ver duas geometrias disjuntas
		// e usar o fallback (first feature) sem falhar.
		const props: Property[] = [
			{
				objectId: 1,
				parId: 1,
				parNum: 1,
				shapeLength: 10,
				shapeArea: 30,
				geometry: [
					[0, 0],
					[2, 0],
					[2, 2],
					[0, 2],
					[0, 0],
				],
				owner: 1,
				freguesia: "Y",
				municipio: "M",
				ilha: "I",
			},
			{
				objectId: 2,
				parId: 2,
				parNum: 2,
				shapeLength: 10,
				shapeArea: 40,
				geometry: [
					[10, 10],
					[12, 10],
					[12, 12],
					[10, 12],
					[10, 10],
				],
				owner: 1,
				freguesia: "Y",
				municipio: "M",
				ilha: "I",
			},
		]
		const graph = new Map<number, Set<number>>([
			[1, new Set([2])],
			[2, new Set([1])],
		])

		const result = mergeAdjacentProperties(props, graph, "freguesia")
		// fallback deve manter a primeira geometria
		const geom = result[0].geometry
		assert.deepStrictEqual(geom[0], [0, 0])
		assert.deepStrictEqual(geom[geom.length - 1], [0, 0])
	})

	test("extractExteriorRing: MultiPolygon sem fechar anel deve extrair primeiro polígono e fechar", () => {
		const multi: Feature<MultiPolygon> = {
			type: "Feature",
			properties: {},
			geometry: {
				type: "MultiPolygon",
				coordinates: [
					// Primeiro MultiPolygon: anel não fechado
					[
						[
							[0, 0],
							[1, 0],
							[1, 1],
							[0, 1],
							// repete o primeiro ponto no fim está em falta
						],
					],
					// Segundo polígono (irrelevante para esta extração)
					[
						[
							[10, 10],
							[11, 10],
							[11, 11],
							[10, 11],
							[10, 10],
						],
					],
				],
			},
		}

		const ring = extractExteriorRing(multi)

		// Deve extrair apenas o primeiro anel do primeiro polígono...
		assert.deepStrictEqual(ring[0], [0, 0])
		// ...e fechar o anel adicionando o primeiro ponto no fim
		const last = ring[ring.length - 1]
		assert.deepStrictEqual(last, [0, 0])
		// Comprimento esperado: 5 (4 originais + 1 de fecho)
		assert.strictEqual(ring.length, 5)
	})
})
