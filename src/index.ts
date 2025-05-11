import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer.ts"
import { buildGraph } from "./graph.ts"
import { averageArea, averageAreaWithAdjacency } from "./calculations.ts"

try {
	console.time("parseCSV")
	const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))
	console.timeEnd("parseCSV")

	console.time("parseProperties")
	const properties: Property[] = []
	for (const rawProp of rawProps) {
		const prop = parseProperty(rawProp)
		if (prop) properties.push(prop)
	}
	console.timeEnd("parseProperties")

	console.log(`Número de propriedades:${properties.length}`)
	console.time("Grafo de propriedades")
	const propertyGraph = buildGraph(properties, "objectId")
	console.timeEnd("Grafo de propriedades")
	//console.log("Grafo de propriedades (por objectId):")
	//for (const [node, neighbours] of propertyGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)

	console.time("Grafo de proprietários")
	const ownerGraph = buildGraph(properties, "owner")
	console.timeEnd("Grafo de proprietários")

	//console.log("Grafo de proprietários (por owner):")
	//for (const [node, neighbours] of ownerGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)

	//Sem adjacencias das propriedades do mesmo proprietário
	console.log("Média de área por freguesia:")
	console.log(averageArea(properties, "freguesia"))
	console.log("Média de área por município:")
	console.log(averageArea(properties, "municipio"))
	console.log("Média de área por ilha:")
	console.log(averageArea(properties, "ilha"))

	// Com adjacencias das propriedades do mesmo proprietario
	console.log("Média de área por freguesia (com adjacências):")
	console.log(averageAreaWithAdjacency(properties, "freguesia"))
	console.log("Média de área por município (com adjacências):")
	console.log(averageAreaWithAdjacency(properties, "municipio"))
	console.log("Média de área por ilha (com adjacências):")
	console.log(averageAreaWithAdjacency(properties, "ilha"))
} catch (error) {
	console.error("Erro ao processar o CSV:", error)
}
