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

export function averageAreaWithAdjacency(properties: Property[], regionType: "freguesia" | "municipio" | "ilha") {
    // Construir grafo de adjacência entre propriedades, usando objectId como nó
    const adjacencyGraph = buildGraph(properties, "objectId");
    const propertyMap = new Map(properties.map(p => [p.objectId, p])); // Map para acesso rápido às propriedades
    const visited = new Set<number>();
    const mergedProperties: Property[] = [];

    // Percorrer as propriedades e agrupar fisicamente adjacentes do mesmo proprietário e mesma região
    for (const property of properties) {
        if (visited.has(property.objectId)) continue;

        const stack = [property.objectId];
        const mergedOwner = property.owner;
        const mergedRegion = property[regionType]; // Região da propriedade atual
        // Iniciar objeto "merge" com área e geometria vazias
        const merged: Property = { ...property, shapeArea: 0, geometry: [] as [number, number][] };

        while (stack.length > 0) {
            const currentId = stack.pop()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const currentProp = propertyMap.get(currentId); // Busca eficiente no Map
            if (!currentProp) continue;

            // Somar área e concatenar geometria
            merged.shapeArea += currentProp.shapeArea;
            merged.geometry.push(...currentProp.geometry);

            // Explorar vizinhos adjacentes, mas apenas do mesmo proprietário e mesma região
            for (const neighborId of adjacencyGraph.get(currentId) || []) {
                const neighbor = propertyMap.get(neighborId); // Busca eficiente no Map
                if (
                    neighbor &&
                    neighbor.owner === mergedOwner && // Mesmo proprietário
                    neighbor[regionType] === mergedRegion && // Mesma região
                    !visited.has(neighborId)
                ) {
                    stack.push(neighborId);
                }
            }
        }

        mergedProperties.push(merged);
    }

    // Calcular média de área por região, usando as propriedades já fundidas
    return Object.fromEntries(
        Object.entries(Object.groupBy(mergedProperties, prop => prop[regionType])).map(([region, props]) => {
            return [region, props!.reduce((acc, prop) => acc + prop.shapeArea, 0) / props!.length];
        })
    );
}
