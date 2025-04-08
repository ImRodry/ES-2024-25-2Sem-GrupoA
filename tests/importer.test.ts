import { test } from "node:test"
import * as assert from "node:assert"
import { parseCSV, parseProperty, Property, RawProperty } from "../src/importer"

const sampleCSV = `
OBJECTID;PAR_ID;PAR_NUM;Shape_Length;Shape_Area;geometry;OWNER;Freguesia;Municipio;Ilha
1;7343148.0;2,99624E+12;57.2469341921808;202.05981432070362;MULTIPOLYGON (((299218.5203999998 3623637.4791, 299218.5033999998 3623637.4715, 299218.04000000004 3623638.4800000004, 299232.7400000002 3623644.6799999997, 299236.6233999999 3623637.1974, 299236.93709999975 3623636.7885999996, 299238.04000000004 3623633.4800000004, 299222.63999999966 3623627.1799999997, 299218.5203999998 3623637.4791)));93;Arco da Calheta;Calheta;Ilha da Madeira (Madeira)
18745;18481050.0;3,03618E+12;0.0;0.0;MULTIPOLYGON EMPTY;574;NA;NA;NA
`.trim(), // trim to remove new lines, just to make reading easier
	expectedRawProperties: RawProperty[] = [
		{
			objectid: "1",
			parId: "7343148.0",
			parNum: "2,99624E+12",
			shapeLength: "57.2469341921808",
			shapeArea: "202.05981432070362",
			geometry:
				"MULTIPOLYGON (((299218.5203999998 3623637.4791, 299218.5033999998 3623637.4715, 299218.04000000004 3623638.4800000004, 299232.7400000002 3623644.6799999997, 299236.6233999999 3623637.1974, 299236.93709999975 3623636.7885999996, 299238.04000000004 3623633.4800000004, 299222.63999999966 3623627.1799999997, 299218.5203999998 3623637.4791)))",
			owner: "93",
			freguesia: "Arco da Calheta",
			municipio: "Calheta",
			ilha: "Ilha da Madeira (Madeira)",
		},
		{
			objectid: "18745",
			parId: "18481050.0",
			parNum: "3,03618E+12",
			shapeLength: "0.0",
			shapeArea: "0.0",
			geometry: "MULTIPOLYGON EMPTY",
			owner: "574",
			freguesia: "NA",
			municipio: "NA",
			ilha: "NA",
		},
	],
	expectedProperties: Property[] = [
		{
			objectId: 1,
			parId: 7343148,
			parNum: 2996240000000,
			shapeLength: 57.2469341921808,
			shapeArea: 202.05981432070362,
			geometry: [
				[299218.5203999998, 3623637.4791],
				[299218.5033999998, 3623637.4715],
				[299218.04000000004, 3623638.4800000004],
				[299232.7400000002, 3623644.6799999997],
				[299236.6233999999, 3623637.1974],
				[299236.93709999975, 3623636.7885999996],
				[299238.04000000004, 3623633.4800000004],
				[299222.63999999966, 3623627.1799999997],
				[299218.5203999998, 3623637.4791],
			],
			owner: 93,
			freguesia: "Arco da Calheta",
			municipio: "Calheta",
			ilha: "Ilha da Madeira (Madeira)",
		},
	]

test("parseCSV correctly parses a CSV string into RawProperty objects", () => {
	const parsedRawProperties = parseCSV(sampleCSV)
	assert.deepStrictEqual(parsedRawProperties, expectedRawProperties)
	assert.strictEqual(parsedRawProperties.length, expectedRawProperties.length)
})

test("parseProperty correctly parses a valid RawProperty into a Property object", () => {
	const parsedProperty = parseProperty(expectedRawProperties[0])
	assert.deepEqual(parsedProperty, expectedProperties[0])
})

test("parseProperty returns null for invalid numeric data", () => {
	const parsedProperty = parseProperty(expectedRawProperties[1])
	assert.strictEqual(parsedProperty, null)
})

test("parseProperty returns null for NaN value", () => {
	const invalidGeometryRawProperty: RawProperty = {
		...expectedRawProperties[0],
		owner: "NaN",
	}
	const parsedProperty = parseProperty(invalidGeometryRawProperty)
	assert.strictEqual(parsedProperty, null)
})

test("parseProperty returns null for empty string", () => {
	const invalidGeometryRawProperty: RawProperty = {
		...expectedRawProperties[0],
		ilha: " ",
	}
	const parsedProperty = parseProperty(invalidGeometryRawProperty)
	assert.strictEqual(parsedProperty, null)
})

test("parseProperty returns null for invalid non-empty geometry", () => {
	const invalidGeometryRawProperty: RawProperty = {
		...expectedRawProperties[0],
		geometry:
			// has 1 point with 4 values
			"MULTIPOLYGON (((299218.5203999998 3623637.4791 299218.5033999998 3623637.4715)))",
	}
	const parsedProperty = parseProperty(invalidGeometryRawProperty)
	assert.strictEqual(parsedProperty, null)
})
