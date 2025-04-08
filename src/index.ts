import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer"
import { buildPropertyGraph, buildOwnerGraph } from "./graph"

try {
	const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))

	const properties: Property[] = []
	for (const rawProp of rawProps) {
		const prop = parseProperty(rawProp)
		if (prop) properties.push(prop)
	}

	console.log(`Total de propriedades importadas: ${properties.length}`)

	// Subconjunto para testes
	const slicedProperties = properties.slice(0, 100)
	console.log(`A construir grafos com ${slicedProperties.length} propriedades...`)

	const propertyGraph = buildPropertyGraph(slicedProperties)
	console.log("Grafo de propriedades (por objectId):")
	for (const [node, neighbours] of propertyGraph.entries()) {
		console.log(`${node} -> ${[...neighbours].join(", ")}`)
	}

	const ownerGraph = buildOwnerGraph(slicedProperties)
	console.log("\nGrafo de proprietários (por owner):")
	for (const [node, neighbours] of ownerGraph.entries()) {
		console.log(`${node} -> ${[...neighbours].join(", ")}`)
	}
} catch (error) {
	console.error("Erro ao processar o CSV:", error)
}
