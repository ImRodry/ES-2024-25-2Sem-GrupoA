import bbox from "@turf/bbox"
import booleanIntersects from "@turf/boolean-intersects"
import { polygon } from "@turf/helpers"
import RBush, { type BBox } from "rbush"
import { Property } from "./importer"

// Converte a geometria para um polígono do Turf (Feature<Polygon>)
export function toTurfPolygon(geometry: [number, number][]) {
	if (!geometry[0].every((c, i) => c === geometry.at(-1)![i])) geometry.push(geometry[0]) // fecha o polígono
	return polygon([geometry])
}

// Função genérica de criação de grafo
export function buildGraph<T extends IndexablePropertyKeys>(
	properties: Property[],
	nodeProp: T
): Map<Property[T], Set<Property[T]>> {
	const graph = new Map<Property[T], Set<Property[T]>>()
	const tree = new RBush<RBushType>()
	const polygons = properties.map(p => toTurfPolygon(p.geometry))
	const bboxes = polygons.map((p, i) => {
		const [minX, minY, maxX, maxY] = bbox(p)
		return {
			minX,
			minY,
			maxX,
			maxY,
			index: i,
		}
	})
	tree.load(bboxes)

	for (const bbox of bboxes) {
		const nodeA = properties[bbox.index][nodeProp]
		if (!graph.has(nodeA)) graph.set(nodeA, new Set())

		const candidates = tree.search(bbox)
		const matches = candidates.filter(item => booleanIntersects(polygons[item.index], polygons[bbox.index]))
		for (const match of matches) {
			const nodeB = properties[match.index][nodeProp]
			if (nodeA === nodeB) continue

			graph.get(nodeA)!.add(nodeB)
			if (!graph.has(nodeB)) graph.set(nodeB, new Set())
			graph.get(nodeB)!.add(nodeA)
		}
	}

	return graph
}

type RBushType = BBox & { index: number }
