import { polygon, booleanIntersects, booleanTouches } from "@turf/turf"
import { Property } from "./importer"

type NodeID = number
type Graph = Map<NodeID, Set<NodeID>>

// Converte a geometria para um polígono do Turf (Feature<Polygon>)
function toTurfPolygon(geometry: [number, number][]) {
	return polygon([[...geometry, geometry[0]]]) // fecha o polígono
}

// Função genérica de criação de grafo
export function buildGraph(properties: Property[], getNodeId: (p: Property) => NodeID): Graph {
	const graph: Graph = new Map()
	const polygons = properties.map(p => toTurfPolygon(p.geometry))

	for (let i = 0; i < properties.length; i++) {
		const nodeA = getNodeId(properties[i])
		if (!graph.has(nodeA)) graph.set(nodeA, new Set())

		for (let j = i + 1; j < properties.length; j++) {
			if (booleanIntersects(polygons[i], polygons[j])) {
				const nodeB = getNodeId(properties[j])
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

// Grafo de propriedades
export function buildPropertyGraph(properties: Property[]): Graph {
	return buildGraph(properties, p => p.objectId)
}

// Grafo de proprietários
export function buildOwnerGraph(properties: Property[]): Graph {
	return buildGraph(properties, p => p.owner)
}
