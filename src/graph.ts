import booleanIntersects from "@turf/boolean-intersects"
import { polygon } from "@turf/helpers"
import { Property } from "./importer"


// Converte a geometria para um polígono do Turf (Feature<Polygon>)
function toTurfPolygon(geometry: [number, number][]) {
	if (!geometry[0].every((c, i) => c === geometry.at(-1)![i]))
		geometry.push(geometry[0]) // fecha o polígono
	return polygon([geometry])
}

// Função genérica de criação de grafo
export function buildGraph(properties: Property[], nodeProp: keyof Property) {
	const graph = new Map()
	const polygons = properties.map(p => toTurfPolygon(p.geometry))

	for (let i = 0; i < properties.length; i++) {
		const nodeA = properties[i][nodeProp]
		if (!graph.has(nodeA)) graph.set(nodeA, new Set())

		for (let j = i + 1; j < properties.length; j++) {
			if (booleanIntersects(polygons[i], polygons[j])) {
				const nodeB = properties[i][nodeProp]
				if (nodeA !== nodeB) {
					graph.get(nodeA)!.add(nodeB)
					if (!graph.has(nodeB)) graph.set(nodeB, new Set())
					graph.get(nodeB)!.add(nodeA)
				}
			}
		}
	}

	return graph
}

