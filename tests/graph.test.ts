import * as assert from "node:assert"
import { test } from "node:test"
import { buildGraph, toTurfPolygon } from "../src/graph"
import { Property } from "../src/importer"

const properties: Property[] = [
	{
		objectId: 8,
		parId: 7351255,
		parNum: 2976220000000,
		shapeLength: 102.30610405746158,
		shapeArea: 415.3709048612241,
		geometry: [
			[297564.6500000004, 3621571.6808],
			[297564.75, 3621571.76],
			[297566.75, 3621579.16],
			[297569.6810999997, 3621578.244000001],
			[297574.9500000002, 3621573.16],
			[297575.02359999996, 3621573.391899999],
			[297583.14159999974, 3621562.4713000003],
			[297581.4797, 3621560.9661],
			[297581.5499999998, 3621560.960000001],
			[297581.1500000004, 3621557.960000001],
			[297573.9500000002, 3621552.5600000005],
			[297572.95249999966, 3621549.424900001],
			[297572.32739999983, 3621549.189200001],
			[297572.25, 3621549.16],
			[297572.2419999996, 3621549.1619000006],
			[297566.0454000002, 3621547.1843],
			[297559.4079, 3621545.8892],
			[297559.4275000002, 3621545.9461000003],
			[297556.4500000002, 3621545.76],
			[297555.3499999996, 3621545.8599999994],
			[297558.07830000017, 3621549.4978],
			[297557.95079999976, 3621549.4507999998],
			[297559.1358000003, 3621551.4560000002],
			[297561.9500000002, 3621550.26],
			[297563.4500000002, 3621552.3599999994],
			[297562.3499999996, 3621554.16],
			[297562.6500000004, 3621556.26],
			[297562.41110000014, 3621556.4089],
			[297563.06070000026, 3621557.3455999997],
			[297563.0499999998, 3621557.3599999994],
			[297564.0499999998, 3621560.76],
			[297566.9500000002, 3621565.460000001],
			[297566.25, 3621567.960000001],
			[297564.6500000004, 3621569.26],
			[297564.6500000004, 3621571.6808],
		],
		owner: 7,
		freguesia: "Arco da Calheta",
		municipio: "Calheta",
		ilha: "Ilha da Madeira (Madeira)",
	},
	{
		objectId: 14,
		parId: 20433561,
		parNum: 2996220000000,
		shapeLength: 45.34495668105491,
		shapeArea: 117.60322003324094,
		geometry: [
			[299098.81740000006, 3622080.8025],
			[299106.3964999998, 3622075.0480000004],
			[299106.5499999998, 3622075.01],
			[299109.75, 3622072.8100000005],
			[299106.3499999996, 3622067.41],
			[299097.3499999996, 3622070.6099999994],
			[299092.25, 3622073.01],
			[299092.9001000002, 3622073.7192],
			[299092.9500000002, 3622073.710000001],
			[299098.81740000006, 3622080.8025],
		],
		owner: 40,
		freguesia: "Arco da Calheta",
		municipio: "Calheta",
		ilha: "Ilha da Madeira (Madeira)",
	},
	{
		objectId: 15,
		parId: 20746817,
		parNum: 2976210000000,
		shapeLength: 45.99013260047487,
		shapeArea: 77.94686062009467,
		geometry: [
			[297586.4343999997, 3621564.392000001],
			[297586.9848999996, 3621561.339299999],
			[297587.1743999999, 3621560.2885999996],
			[297587.3499999996, 3621560.26],
			[297588.1074000001, 3621557.3145000003],
			[297578.3499999996, 3621551.460000001],
			[297573.82380000036, 3621549.7534],
			[297572.95249999966, 3621549.424900001],
			[297573.9500000002, 3621552.5600000005],
			[297581.1500000004, 3621557.960000001],
			[297581.5499999998, 3621560.960000001],
			[297581.4797, 3621560.9661],
			[297583.14159999974, 3621562.4713000003],
			[297583.1500000004, 3621562.460000001],
			[297583.6841000002, 3621562.7742],
			[297585.8513000002, 3621564.0490000006],
			[297586.4343999997, 3621564.392000001],
		],
		owner: 20,
		freguesia: "Arco da Calheta",
		municipio: "Calheta",
		ilha: "Ilha da Madeira (Madeira)",
	},
	{
		objectId: 16,
		parId: 20746818,
		parNum: 2976220000000,
		shapeLength: 77.38560252506595,
		shapeArea: 347.829668448073,
		geometry: [
			[297586.4343999997, 3621564.392000001],
			[297588.03670000006, 3621565.3345999997],
			[297588.06269999966, 3621565.3160999995],
			[297588.1034000004, 3621565.3737000003],
			[297588.25600000005, 3621565.59],
			[297591.9480999997, 3621570.8203999996],
			[297595.10170000046, 3621575.780200001],
			[297597.71719999984, 3621580.1851000004],
			[297607.1448999997, 3621579.3827],
			[297607.30370000005, 3621579.3692000005],
			[297608.25, 3621578.960000001],
			[297609.25, 3621561.26],
			[297605.25, 3621560.5600000005],
			[297605.1676000003, 3621560.6731000002],
			[297605.1500000004, 3621560.5600000005],
			[297602.75, 3621560.3599999994],
			[297598.0499999998, 3621560.66],
			[297594.9500000002, 3621559.5600000005],
			[297588.37200000044, 3621557.5667000003],
			[297588.3499999996, 3621557.460000001],
			[297588.1074000001, 3621557.3145000003],
			[297587.3499999996, 3621560.26],
			[297587.1743999999, 3621560.2885999996],
			[297586.9848999996, 3621561.339299999],
			[297586.4343999997, 3621564.392000001],
		],
		owner: 31,
		freguesia: "Arco da Calheta",
		municipio: "Calheta",
		ilha: "Ilha da Madeira (Madeira)",
	},
]

test("buildGraph returns an empty graph when properties array is empty", () => {
	const graph = buildGraph([], "objectId")
	assert.strictEqual(graph.size, 0)
})

test("buildGraph constructs correct adjacency graph using objectId", () => {
	const expectedGraphByObjectId = new Map<number, Set<number>>([
		[8, new Set([15])],
		[14, new Set()],
		[15, new Set([8, 16])],
		[16, new Set([15])],
	])
	const graph = buildGraph(properties, "objectId")
	for (const [key, neighbors] of expectedGraphByObjectId) {
		assert.ok(graph.has(key), `Missing node for key ${key}`)
		assert.deepStrictEqual(graph.get(key), neighbors, `Neighbors for key ${key} do not match`)
	}
	assert.strictEqual(graph.size, expectedGraphByObjectId.size, `Graph size mismatch`)
})

test("buildGraph constructs correct adjacency graph using owner", () => {
	const expectedGraphByOwner = new Map<number, Set<number>>([
		[7, new Set([20])],
		[20, new Set([7, 31])],
		[31, new Set([20])],
		[40, new Set()],
	])
	const graph = buildGraph(properties, "owner")
	for (const [key, neighbors] of expectedGraphByOwner) {
		assert.ok(graph.has(key), `Missing node for owner ${key}`)
		assert.deepStrictEqual(graph.get(key), neighbors, `Neighbors for owner ${key} do not match`)
	}
	assert.strictEqual(graph.size, expectedGraphByOwner.size, `Graph size mismatch`)
})

test("toTurfPolygon closes a polygon if not already closed", () => {
	const openGeometry: [number, number][] = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	]
	const polyFeature = toTurfPolygon(openGeometry)
	const coords = polyFeature.geometry.coordinates[0]
	assert.deepStrictEqual(coords[0], coords[coords.length - 1])
})

test("toTurfPolygon does not duplicate closing coordinate if already closed", () => {
	const closedGeometry: [number, number][] = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
		[0, 0],
	]
	const polyFeature = toTurfPolygon(closedGeometry)
	assert.strictEqual(polyFeature.geometry.coordinates[0].length, closedGeometry.length)
})
