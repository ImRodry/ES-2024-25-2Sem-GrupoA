import { Property } from "./importer.ts"
import { buildGraph } from "./graph.ts"

export function averageArea(properties: Property[], regionType: "freguesia" | "municipio" | "ilha") {
	return Object.fromEntries(
		Object.entries(Object.groupBy(properties, prop => prop[regionType])).map(([region, props]) => {
			// despite TS saying props can be undefined, it will never be, and will always have length 1 or more as per the spec, this is just for type safety
			return [region, props!.reduce((acc, prop) => acc + prop.shapeArea, 0) / props!.length]
		})
	)
}

export function averageAreaWithAdjacency(
    properties: Property[],
    adjacencyGraph: Map<number, Set<number>>,
    regionType: "freguesia" | "municipio" | "ilha"
) {
    const propertyMap = new Map(properties.map(p => [p.objectId, p]));
    const visited = new Set<number>();
    const mergedProperties: Property[] = [];

    for (const property of properties) {
        if (visited.has(property.objectId)) continue;

        const stack = [property.objectId];
        const mergedOwner = property.owner;
        const mergedRegion = property[regionType];
        const merged: Property = { ...property, shapeArea: 0, geometry: [] as [number, number][] };

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const currentProp = propertyMap.get(currentId);
            if (!currentProp) continue;

            merged.shapeArea += currentProp.shapeArea;
            merged.geometry.push(...currentProp.geometry);

            for (const neighborId of adjacencyGraph.get(currentId) || []) {
                const neighbor = propertyMap.get(neighborId);
                if (
                    neighbor &&
                    neighbor.owner === mergedOwner &&
                    neighbor[regionType] === mergedRegion &&
                    !visited.has(neighborId)
                ) {
                    stack.push(neighborId);
                }
            }
        }

        mergedProperties.push(merged);
    }

    return Object.fromEntries(
        Object.entries(Object.groupBy(mergedProperties, prop => prop[regionType]))
              .map(([region, props]) => [
                  region,
                  props!.reduce((sum, p) => sum + p.shapeArea, 0) / props!.length
              ])
    );
}
