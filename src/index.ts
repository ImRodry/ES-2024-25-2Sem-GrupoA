import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer"
import { buildGraph } from "./graph"

try {
	const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))

	const properties: Property[] = []
	for (const rawProp of rawProps) {
		const prop = parseProperty(rawProp)
		if (prop) properties.push(prop)
	}

	console.log(`A construir grafos com ${properties.length} propriedades...`)
	console.time("propriedades")
	const propertyGraph = buildGraph(properties, "objectId")
	console.timeEnd("propriedades")
	console.log("Grafo de propriedades (por objectId):")
	for (const [node, neighbours] of propertyGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)

	console.time("owners")
	const ownerGraph = buildGraph(properties, "owner")
	console.timeEnd("owners")

	console.log("Grafo de proprietários (por owner):")
	for (const [node, neighbours] of ownerGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)
} catch (error) {
	console.error("Erro ao processar o CSV:", error)
}
