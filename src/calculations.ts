import { Property } from "./importer.ts"

export function averageArea(properties: Property[], regionType: "freguesia" | "municipio" | "ilha") {
	return Object.fromEntries(
		Object.entries(Object.groupBy(properties, prop => prop[regionType])).map(([region, props]) => {
			// despite TS saying props can be undefined, it will never be, and will always have length 1 or more as per the spec, this is just for type safery
			return [region, props!.reduce((acc, prop) => acc + prop.shapeArea, 0) / props!.length]
		})
	)
}
