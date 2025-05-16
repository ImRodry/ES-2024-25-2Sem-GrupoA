import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { suggestPropertyExchanges } from "../src/propertyExchange.ts"
import type { Property } from "../src/importer.ts"

describe("Property Exchange Suggestions", () => {
	// Helper function to create a test property
	function createTestProperty(
		objectId: number,
		owner: number,
		shapeArea: number,
		freguesia: string = "TestFreguesia"
	): Property {
		return {
			objectId,
			parId: objectId,
			parNum: objectId,
			shapeLength: 100,
			shapeArea,
			geometry: [
				[0, 0],
				[0, 1],
				[1, 1],
				[1, 0],
				[0, 0],
			],
			owner,
			freguesia,
			municipio: "TestMunicipio",
			ilha: "TestIlha",
		}
	}

	it("should suggest beneficial property exchanges", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000), // Owner 1's property
			createTestProperty(2, 2, 500), // Owner 2's property
			createTestProperty(3, 1, 300), // Owner 1's second property
			createTestProperty(4, 2, 800), // Owner 2's second property
		]

		// Create adjacency graph where all properties are adjacent
		const propertyGraph = new Map([
			[1, new Set([2, 3, 4])],
			[2, new Set([1, 3, 4])],
			[3, new Set([1, 2, 4])],
			[4, new Set([1, 2, 3])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph, 2)

		assert.equal(suggestions.length > 0, true, "Should find at least one suggestion")
		assert.equal(
			suggestions[0].owner1 !== suggestions[0].owner2,
			true,
			"Should suggest exchanges between different owners"
		)
	})

	it("should respect maximum suggestions limit", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000),
			createTestProperty(2, 2, 500),
			createTestProperty(3, 3, 800),
			createTestProperty(4, 4, 600),
		]

		const propertyGraph = new Map([
			[1, new Set([2, 3, 4])],
			[2, new Set([1, 3, 4])],
			[3, new Set([1, 2, 4])],
			[4, new Set([1, 2, 3])],
		])

		const maxSuggestions = 2
		const suggestions = suggestPropertyExchanges(properties, propertyGraph, maxSuggestions)

		assert.equal(suggestions.length <= maxSuggestions, true, "Should not exceed maximum suggestions limit")
	})

	it("should prioritize same freguesia exchanges", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000, "Freguesia1"),
			createTestProperty(2, 2, 500, "Freguesia1"), // Same freguesia as property 1
			createTestProperty(3, 2, 800, "Freguesia2"), // Different freguesia
		]

		const propertyGraph = new Map([
			[1, new Set([2, 3])],
			[2, new Set([1, 3])],
			[3, new Set([1, 2])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph)

		// The first suggestion should involve properties from the same freguesia
		assert.equal(
			suggestions[0].property1.freguesia === suggestions[0].property2.freguesia,
			true,
			"Should prioritize exchanges within the same freguesia"
		)
	})

	it("should handle no beneficial exchanges case", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000), // Owner 1: 1000 area
			createTestProperty(2, 2, 1000), // Owner 2: 1000 area (exactly same area)
		]

		// Properties are adjacent but exchange would not improve average areas
		const propertyGraph = new Map([
			[1, new Set([2])],
			[2, new Set([1])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph)

		assert.equal(
			suggestions.length,
			0,
			"Should return empty array when properties have identical areas and exchange would not improve averages"
		)
	})

	it("should consider adjacent properties", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000),
			createTestProperty(2, 2, 800),
			createTestProperty(3, 2, 600), // Not adjacent to property 1
		]

		// Only property 2 is adjacent to property 1
		const propertyGraph = new Map([
			[1, new Set([2])],
			[2, new Set([1, 3])],
			[3, new Set([2])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph)

		// Should only suggest exchanges between adjacent properties
		assert.equal(
			suggestions.every(s => propertyGraph.get(s.property1.objectId)?.has(s.property2.objectId)),
			true,
			"Should only suggest exchanges between adjacent properties"
		)
	})

	it("should calculate correct area improvements", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000), // Owner 1: avg = 1000
			createTestProperty(2, 2, 500), // Owner 2: avg = 650
			createTestProperty(3, 2, 800),
		]

		const propertyGraph = new Map([
			[1, new Set([2, 3])],
			[2, new Set([1, 3])],
			[3, new Set([1, 2])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph)

		for (const suggestion of suggestions) {
			assert.equal(
				typeof suggestion.areaImprovement === "number" && suggestion.areaImprovement >= 0,
				true,
				"Area improvement should be a non-negative number"
			)
			assert.equal(
				typeof suggestion.mergedAreaImprovement === "number" && suggestion.mergedAreaImprovement >= 0,
				true,
				"Merged area improvement should be a non-negative number"
			)
		}
	})

	it("should handle multiple owners with multiple properties", () => {
		const properties: Property[] = [
			createTestProperty(1, 1, 1000),
			createTestProperty(2, 1, 800),
			createTestProperty(3, 2, 600),
			createTestProperty(4, 2, 900),
			createTestProperty(5, 3, 700),
			createTestProperty(6, 3, 750),
		]

		const propertyGraph = new Map([
			[1, new Set([3, 5])],
			[2, new Set([4, 6])],
			[3, new Set([1, 5])],
			[4, new Set([2, 6])],
			[5, new Set([1, 3])],
			[6, new Set([2, 4])],
		])

		const suggestions = suggestPropertyExchanges(properties, propertyGraph, 3)

		// Check that suggestions maintain property ownership balance
		const ownerCounts = new Map<number, number>()
		for (const suggestion of suggestions) {
			ownerCounts.set(suggestion.owner1, (ownerCounts.get(suggestion.owner1) || 0) + 1)
			ownerCounts.set(suggestion.owner2, (ownerCounts.get(suggestion.owner2) || 0) + 1)
		}

		// No owner should be involved in more than 2 suggestions
		assert.equal(
			Array.from(ownerCounts.values()).every(count => count <= 2),
			true,
			"No owner should be involved in more than 2 suggestions"
		)
	})
})
