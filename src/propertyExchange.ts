import { writeFileSync } from "node:fs"
import type { Property } from "./importer.ts"

/**
 * Calculates initial metrics for each owner based on their properties (area, count, etc.).
 * @param properties Array of properties to calculate metrics for.
 * @param propertyGraph Graph of properties to find adjacent properties.
 * @returns Map of owner IDs to their metrics.
 */
function calculateOwnerMetrics(mergedProps: Property[]): Map<number, OwnerMetrics> {
	const ownerMetrics = new Map<number, OwnerMetrics>()

	// Calcular métricas para cada owner
	for (const [owner, props] of Object.entries(Object.groupBy(mergedProps, prop => prop.owner))) {
		const totalArea = props!.reduce((sum, p) => sum + p.shapeArea, 0)

		ownerMetrics.set(Number(owner), {
			totalArea,
			propertyCount: props!.length,
			averageArea: totalArea / props!.length,
			properties: props!,
		})
	}

	return ownerMetrics
}

/**
 * Calculates the exchange score between two properties based on their owners' metrics.
 * @param owner1Metrics Metrics for the first owner.
 * @param owner2Metrics Metrics for the second owner.
 * @param prop1 First property to exchange.
 * @param prop2 Second property to exchange.
 * @param bothTouch Whether both properties touch others from the same owner (or just the first one)
 * @returns The calculated exchange score.
 */
export function calculateExchangeScore(
	owner1Metrics: OwnerMetrics,
	owner2Metrics: OwnerMetrics,
	prop1: Property,
	prop2: Property,
	bothTouch: boolean
): number {
	// If owner2's property doesn't touch and is smaller, skip
	if (!bothTouch && prop2.shapeArea > prop1.shapeArea) {
		return -Infinity
	}

	const averageAreaDiff =
		(owner1Metrics.totalArea + owner2Metrics.totalArea) /
			(owner1Metrics.propertyCount + owner2Metrics.propertyCount - (bothTouch ? 2 : 1)) -
		(owner1Metrics.totalArea + owner2Metrics.totalArea) /
			(owner1Metrics.propertyCount + owner2Metrics.propertyCount)
	const bothTouchWeight = bothTouch ? 2 : prop1.freguesia === prop2.freguesia ? 1 : 0

	return (
		(-Math.abs(prop1.shapeArea - prop2.shapeArea) * 2) /
			// Ratio of areas - the higher the ratio, the better
			(Math.min(prop1.shapeArea, prop2.shapeArea) / Math.max(prop1.shapeArea, prop2.shapeArea)) +
		averageAreaDiff * bothTouchWeight
	)
}

/**
 * Suggests property exchanges to maximize average area for owners.
 * @param mergedProperties Array of properties to suggest exchanges for.
 * @param mergedGraph Graph of properties to find adjacent properties.
 * @param mergedGraph Graph of owners to adjacent owners.
 * @param maxSuggestions Maximum number of suggestions to return.
 * @param maxSuggestionsPerOwner Maximum number of suggestions per owner.
 * @returns Array of suggested property exchanges.
 */
export function suggestPropertyExchanges(
	mergedProperties: Property[],
	mergedGraph: Map<number, Set<number>>,
	ownerGraph: Map<number, Set<number>>,
	maxSuggestions: number = 10,
	maxSuggestionsPerOwner: number = Infinity
): PropertyExchange[] {
	const suggestions: PropertyExchange[] = []
	const ownerMetrics = calculateOwnerMetrics(mergedProperties)
	const ownerSuggestionCount = new Map<number, number>()
	const visited = new Set<number>()

	// Para cada propriedade
	for (const property of mergedProperties) {
		const neighbors = mergedGraph.get(property.objectId)
		if (!neighbors?.size) continue
		visited.add(property.objectId)

		const owner1Metrics = ownerMetrics.get(property.owner)!
		for (const neighborId of neighbors) {
			// Skip if adjacent owner already has max suggestions
			if (visited.has(neighborId)) continue
			const neighbor = mergedProperties.find(p => p.objectId === neighborId)!

			const owner2Metrics = ownerMetrics.get(neighbor.owner)!
			// Ordenar propriedades do owner adjacente por área (potencial de melhoria)
			let potentialCandidates = owner1Metrics.properties.filter(
					p => p.objectId !== property.objectId && ownerGraph.get(neighbor.owner)?.has(p.objectId)
				),
				bothTouch = true
			if (!potentialCandidates.length) {
				potentialCandidates = owner1Metrics.properties.filter(p => p.objectId !== property.objectId)
				bothTouch = false
			}
			// Pair each property with its score
			const scoredCandidates = potentialCandidates
				.map(p => ({
					property: p,
					score: calculateExchangeScore(owner1Metrics, owner2Metrics, p, neighbor, bothTouch),
				}))
				.sort((a, b) => a.score - b.score)

			for (const { property: candidate, score } of scoredCandidates) {
				if (score === 0) continue
				if (
					ownerSuggestionCount.get(property.owner) === maxSuggestionsPerOwner ||
					ownerSuggestionCount.get(neighbor.owner) === maxSuggestionsPerOwner
				)
					break

				suggestions.push({
					owner1: candidate.owner,
					owner2: neighbor.owner,
					property1: candidate,
					property2: neighbor,
					areaImprovement:
						(owner1Metrics.totalArea + owner2Metrics.totalArea) /
							(owner1Metrics.propertyCount + owner2Metrics.propertyCount - (bothTouch ? 2 : 1)) -
						(owner1Metrics.totalArea + owner2Metrics.totalArea) /
							(owner1Metrics.propertyCount + owner2Metrics.propertyCount),
					mergedAreaImprovement1:
						(owner1Metrics.totalArea - candidate.shapeArea + neighbor.shapeArea) /
							// First property always touches
							(owner1Metrics.propertyCount - 1) -
						owner1Metrics.averageArea,
					mergedAreaImprovement2:
						(owner2Metrics.totalArea - neighbor.shapeArea + candidate.shapeArea) /
							(owner2Metrics.propertyCount - (bothTouch ? 1 : 0)) -
						owner2Metrics.averageArea,
					sameFreguesia: neighbor.freguesia === candidate.freguesia,
					bothTouch,
					totalScore: score,
				})

				// Update suggestion counts for both owners
				ownerSuggestionCount.set(property.owner, (ownerSuggestionCount.get(property.owner) ?? 0) + 1)
				ownerSuggestionCount.set(neighbor.owner, (ownerSuggestionCount.get(neighbor.owner) ?? 0) + 1)
			}
		}
	}

	// Ordenar sugestões por score e limitar ao número máximo
	console.log(suggestions.length)
	suggestions.sort((a, b) => b.totalScore - a.totalScore)
	const print = suggestions.map(s => {
		const { property1, property2, ...rest } = s
		return { prop1Area: property1.shapeArea, prop2Area: property2.shapeArea, ...rest }
	})
	writeFileSync("suggestions.json", JSON.stringify(print, null, "\t"))
	return suggestions.slice(0, maxSuggestions)
}

/**
 * Object representing a property exchange suggestion.
 */
interface PropertyExchange {
	owner1: number
	owner2: number
	property1: Property
	property2: Property
	areaImprovement: number
	mergedAreaImprovement1: number
	mergedAreaImprovement2: number
	sameFreguesia: boolean
	bothTouch: boolean
	totalScore: number
}

/**
 * Object representing the metrics for an owner.
 */
interface OwnerMetrics {
	totalArea: number
	propertyCount: number
	averageArea: number
	properties: Property[]
}
