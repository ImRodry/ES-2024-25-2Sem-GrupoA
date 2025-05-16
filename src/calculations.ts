import { featureCollection } from "@turf/helpers"
import union from "@turf/union"
import { toTurfPolygon } from "./graph.ts"
import type { Feature, Polygon, MultiPolygon } from "geojson"
import type { Property } from "./importer.ts"

/**
 * Calculates the average area of properties grouped by a specified region type (freguesia, municipio, ilha).
 * @param properties Array of properties to calculate the average area for.
 * @param regionType The type of region to group properties by (freguesia, municipio, ilha).
 * @returns An object of region names mapped to the average area of properties in that region.
 */
export function averageArea(properties: Property[], regionType: "freguesia" | "municipio" | "ilha") {
	return Object.fromEntries(
		Object.entries(Object.groupBy(properties, prop => prop[regionType])).map(([region, props]) => {
			// despite TS saying props can be undefined, it will never be, and will always have length 1 or more as per the spec, this is just for type safety
			return [region, props!.reduce((acc, prop) => acc + prop.shapeArea, 0) / props!.length]
		})
	)
}

/**
 * Extrai o anel exterior de um Feature<Polygon|MultiPolygon> e garante que está fechado.
 */
export function extractExteriorRing(feat: Feature<Polygon | MultiPolygon>): [number, number][] {
	let ring: [number, number][]

	if (feat.geometry.type === "Polygon") {
		ring = feat.geometry.coordinates[0] as [number, number][]
	} else {
		// MultiPolygon: primeiro polí­gono, anel exterior
		ring = feat.geometry.coordinates[0][0] as [number, number][]
	}

	const first = ring[0]
	const last = ring[ring.length - 1]
	if (first[0] !== last[0] || first[1] !== last[1]) {
		ring = [...ring, first]
	}

	return ring
}

/**
 * Merges adjacent properties of the same owner based on their adjacency graph and a specified region type (freguesia, municipio, ilha).
 * @param properties Array of properties to merge.
 * @param adjacencyGraph Adjacency graph of properties.
 * @param regionType The type of region to merge properties by (freguesia, municipio, ilha).
 * @returns An array of merged properties.
 */
export function mergeAdjacentProperties(
	properties: Property[],
	adjacencyGraph: Map<number, Set<number>>,
	regionType: "freguesia" | "municipio" | "ilha"
): Property[] {
	const propertyMap = new Map(properties.map(p => [p.objectId, p]))
	const visited = new Set<number>()
	const mergedProperties: Property[] = []

	for (const property of properties) {
		if (visited.has(property.objectId)) continue

		const stack = [property.objectId]
		const mergedOwner = property.owner
		const mergedRegion = property[regionType]

		const geometriesRaw: Property["geometry"][] = []
		let mergedShapeArea = 0

		while (stack.length > 0) {
			const currentId = stack.pop()!
			if (visited.has(currentId)) continue
			visited.add(currentId)

			const currentProp = propertyMap.get(currentId)
			if (!currentProp) continue

			mergedShapeArea += currentProp.shapeArea
			geometriesRaw.push(currentProp.geometry)

			const neighbors = adjacencyGraph.get(currentId)
			if (!neighbors) continue

			for (const neighborId of neighbors) {
				const neighbor = propertyMap.get(neighborId)
				if (
					neighbor &&
					neighbor.owner === mergedOwner &&
					neighbor[regionType] === mergedRegion &&
					!visited.has(neighborId)
				) {
					stack.push(neighborId)
				}
			}
		}

		// converte para Features
		const features = geometriesRaw.map(toTurfPolygon)

		// une geometrias: tenta union, mas em caso de null, usa primeiro feature
		let mergedFeat: Feature<Polygon | MultiPolygon>
		if (features.length > 1) {
			const u = union(featureCollection(features))
			mergedFeat = u ?? features[0]
		} else {
			mergedFeat = features[0]
		}

		const exteriorRing = extractExteriorRing(mergedFeat)

		mergedProperties.push({
			...property,
			shapeArea: mergedShapeArea,
			geometry: exteriorRing,
		})
	}

	return mergedProperties
}
