import test, { suite } from "node:test"
import assert from "node:assert"
import { averageArea } from "../src/calculations.ts"

interface Property {
	objectId: number
	parId: number
	parNum: number
	shapeLength: number
	shapeArea: number
	geometry: [number, number][]
	owner: number
	freguesia: string
	municipio: string
	ilha: string
}

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
})
