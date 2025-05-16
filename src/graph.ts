import bbox from "@turf/bbox"
import booleanIntersects from "@turf/boolean-intersects"
import { polygon } from "@turf/helpers"
import RBush, { type BBox } from "rbush"
import type { Property } from "./importer.ts"

/**
 * Converts an array of polar coordinates to a Turf.js polygon object, whilst making sure the polygon is closed (first and last coordinates are the same).
 * @param geometry Array of polar coordinates representing the geometry of a property.
 * @returns A Turf.js polygon object representing the property geometry.
 */
export function toTurfPolygon(geometry: [number, number][]) {
	// close the polygon if not already closed
	if (!geometry[0].every((c, i) => c === geometry.at(-1)![i])) geometry.push(geometry[0])
	return polygon([geometry])
}

/**
 * Builds a graph from an array of properties, checking which properties intersect with each other.
 * Each property is represented as a node, and edges are created between nodes that intersect.
 * @param properties Array of properties to add to the graph
 * @param nodeProp Property key to use as node identifier
 * @returns A map of nodes and their neighbors
 */
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

/**
 * Type to be inserted into the RBush tree
 */
type RBushType = BBox & { index: number }

/**
 * Names of the properties that can be used as node identifiers in the graph.
 */
export type IndexablePropertyKeys = {
	[K in keyof Property]: Property[K] extends keyof any ? K : never
}[keyof Property]
