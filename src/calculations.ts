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
			return [region, props!.reduce((acc, prop) => acc + prop.shapeArea, 0) / props!.length]
		})
	)
}
