import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer.ts"
import { buildGraph } from "./graph.ts"
import { averageArea } from "./calculations.ts"
import { mergeAdjacentProperties } from "./mergeProperties.ts"
import { suggestPropertyExchanges } from "./propertyExchange.ts"

try {
	console.time("parseCSV")
	const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))
	console.timeEnd("parseCSV")
	console.log("CSV lido com sucesso. Número de linhas:", rawProps.length)

	console.time("parseProperties")
	const properties: Property[] = []
	for (const rawProp of rawProps) {
		const prop = parseProperty(rawProp)
		if (prop) properties.push(prop)
	}
	console.timeEnd("parseProperties")
	console.log("Properties parseadas com sucesso. Número de propriedades válidas:", properties.length)

	console.log(`Número de propriedades:${properties.length}`)
	console.time("Grafo de propriedades")
	const propertyGraph = buildGraph(properties, "objectId")
	console.timeEnd("Grafo de propriedades")
	console.log("Grafo de propriedades (por objectId):")
	for (const [node, neighbours] of propertyGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)

	console.time("Grafo de proprietários")
	const ownerGraph = buildGraph(properties, "owner")
	console.timeEnd("Grafo de proprietários")

	console.log("Grafo de proprietários (por owner):")
	for (const [node, neighbours] of ownerGraph.entries()) console.log(`${node} -> ${[...neighbours].join(", ")}`)

	// Sem adjacencias das propriedades do mesmo proprietário
	console.log("Média de área por freguesia:")
	console.log(averageArea(properties, "freguesia"))
	console.log("Média de área por município:")
	console.log(averageArea(properties, "municipio"))
	console.log("Média de área por ilha:")
	console.log(averageArea(properties, "ilha"))

	console.time("Tempo com adjacencias (freguesia)")
	const mergedProperties = mergeAdjacentProperties(properties, propertyGraph, "freguesia")
	console.timeEnd("Tempo com adjacencias (freguesia)")
	console.log(averageArea(mergedProperties, "freguesia"))

	const mergedGraph = buildGraph(mergedProperties, "objectId")
	// Sugestões de trocas de propriedades
	console.log("\nSugestões de trocas de propriedades para maximizar área média:")
	console.time("Tempo de cálculo das sugestões")
	const suggestions = suggestPropertyExchanges(mergedProperties, mergedGraph, ownerGraph)
	console.timeEnd("Tempo de cálculo das sugestões")

	if (suggestions.length === 0) {
		console.log("Não foram encontradas trocas que melhorariam a área média")
	} else {
		suggestions.forEach((suggestion, index) => {
			console.log(`\nSugestão ${index + 1}:`)
			console.log(
				`Proprietário ${suggestion.owner1} troca a propriedade ${suggestion.property1.objectId} (área: ${suggestion.property1.shapeArea})`
			)
			console.log(
				`com Proprietário ${suggestion.owner2} pela propriedade ${suggestion.property2.objectId} (área: ${suggestion.property2.shapeArea})`
			)
			console.log(`Melhoria na área média total: ${suggestion.areaImprovement.toFixed(2)}`)
			console.log(`Melhoria na área média do owner 1 após merge: ${suggestion.mergedAreaImprovement1.toFixed(2)}`)
			console.log(`Melhoria na área média do owner 2 após merge: ${suggestion.mergedAreaImprovement2.toFixed(2)}`)
			console.log(`Mesma freguesia: ${suggestion.sameFreguesia ? "Sim" : "Não"}`)
			console.log(`Ambas tocam: ${suggestion.bothTouch ? "Sim" : "Não"}`)
			console.log(`Score total: ${suggestion.totalScore}`)
		})
	}
} catch (error) {
	console.error("Erro ao processar o CSV:", error)
}
