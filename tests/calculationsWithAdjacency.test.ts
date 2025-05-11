import { test, suite } from "node:test"
import assert from "node:assert"
import { averageAreaWithAdjacency } from "../src/calculations.ts"
import type { Property } from "../src/importer.ts"

const sampleProperties: Property[] = [
    {
        objectId: 1,
        parId: 101,
        parNum: 1001,
        shapeLength: 20,
        shapeArea: 100,
        geometry: [[0, 0], [1, 0], [1, 1], [0, 1]],
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
        geometry: [[1, 0], [2, 0], [2, 1], [1, 1]],
        owner: 1, // Same owner as objectId 1
        freguesia: "A",
        municipio: "M1",
        ilha: "I2",
    },
    {
        objectId: 3,
        parId: 103,
        parNum: 1003,
        shapeLength: 30,
        shapeArea: 200,
        geometry: [[3, 3], [4, 3], [4, 4], [3, 4]],
        owner: 2,
        freguesia: "B",
        municipio: "M2",
        ilha: "I2",
    },
]

suite("Calculation tests with adjacency", () => {
    test("averageAreaWithAdjacency: average by freguesia", () => {
        const result = averageAreaWithAdjacency(sampleProperties, "freguesia")
        assert.deepStrictEqual(result, {
            A: 500, // (100 + 400 merged as one property) / 1
            B: 200, // (200) / 1
        })
    })

    test("averageAreaWithAdjacency: average by municipio", () => {
        const result = averageAreaWithAdjacency(sampleProperties, "municipio")
        assert.deepStrictEqual(result, {
            M1: 500, // (100 + 400 merged as one property) / 1
            M2: 200, // (200) / 1
        })
    })

    test("averageAreaWithAdjacency: average by ilha", () => {
        const result = averageAreaWithAdjacency(sampleProperties, "ilha")
        assert.deepStrictEqual(result, {
            I2: 350, // (100 + 400 merged as one property + 200) / 2
        })
    })

    test("averageAreaWithAdjacency: all shape areas are zero", () => {
        const propsZero: Property[] = sampleProperties.map(p => ({ ...p, shapeArea: 0 }))
        const result = averageAreaWithAdjacency(propsZero, "freguesia")
        assert.deepStrictEqual(result, {
            A: 0, // (0 + 0 merged as one property) / 1
            B: 0, // (0) / 1
        })
    })

    test("averageAreaWithAdjacency: only one property in one region", () => {
        const props: Property[] = [sampleProperties[0]]
        const result = averageAreaWithAdjacency(props, "ilha")
        assert.deepStrictEqual(result, {
            I2: 100, // (100) / 1
        })
    })

    test("averageAreaWithAdjacency: empty property list", () => {
        const result = averageAreaWithAdjacency([], "municipio")
        assert.deepStrictEqual(result, {})
    })

    test("averageAreaWithAdjacency: multiple unique regions with one property each", () => {
        const props: Property[] = [
            { ...sampleProperties[0], freguesia: "X", shapeArea: 50 },
            { ...sampleProperties[1], freguesia: "Y", shapeArea: 150 },
            { ...sampleProperties[2], freguesia: "Z", shapeArea: 300 },
        ]
        const result = averageAreaWithAdjacency(props, "freguesia")
        assert.deepStrictEqual(result, {
            X: 50,
            Y: 150,
            Z: 300,
        })
    })
})