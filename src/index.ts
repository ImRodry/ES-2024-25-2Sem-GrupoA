import { importCSV, Property } from "./importer"
import { buildPropertyGraph, buildOwnerGraph } from "./graph"

const CSV_PATH = "data/Madeira-Moodle-1.1.csv" //Path para o CSV

try {
	const allProperties: Property[] = importCSV(CSV_PATH)
	console.log(`Total de propriedades importadas: ${allProperties.length}`)

	// Subconjunto para testes
	const properties = allProperties.slice(0, 100)
	console.log(`A construir grafos com ${properties.length} propriedades...`)

	const propertyGraph = buildPropertyGraph(properties)
	console.log("Grafo de propriedades (por objectId):")
	for (const [node, neighbours] of propertyGraph.entries()) {
		console.log(`${node} -> ${[...neighbours].join(", ")}`)
	}

	const ownerGraph = buildOwnerGraph(properties)
	console.log("\nGrafo de proprietários (por owner):")
	for (const [node, neighbours] of ownerGraph.entries()) {
		console.log(`${node} -> ${[...neighbours].join(", ")}`)
	}
} catch (error) {
	console.error("Erro ao processar o CSV:", error)
}
