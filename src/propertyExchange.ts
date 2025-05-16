import type { Property } from "./importer.ts"
import { mergeAdjacentProperties } from "./calculations.ts"

interface PropertyExchange {
    owner1: number
    owner2: number
    property1: Property
    property2: Property
    areaImprovement: number
    mergedAreaImprovement: number
    sameFreguesia: boolean
    totalScore: number
}

interface OwnerMetrics {
    totalArea: number
    propertyCount: number
    averageArea: number
    properties: Property[]
    mergedArea: number
    mergedCount: number
    mergedAverageArea: number
}

function calculateInitialMetrics(
    properties: Property[],
    propertyGraph: Map<number, Set<number>>
): Map<number, OwnerMetrics> {
    const ownerMetrics = new Map<number, OwnerMetrics>()
    
    // Agrupar propriedades por owner
    const ownerProperties = new Map<number, Property[]>()
    for (const prop of properties) {
        if (!ownerProperties.has(prop.owner)) {
            ownerProperties.set(prop.owner, [])
        }
        ownerProperties.get(prop.owner)!.push(prop)
    }
    
    // Calcular métricas para cada owner
    for (const [owner, props] of ownerProperties) {
        const totalArea = props.reduce((sum, p) => sum + p.shapeArea, 0)
        const mergedProps = mergeAdjacentProperties(props, propertyGraph, "freguesia")
        const mergedArea = mergedProps.reduce((sum, p) => sum + p.shapeArea, 0)
        
        ownerMetrics.set(owner, {
            totalArea,
            propertyCount: props.length,
            averageArea: totalArea / props.length,
            properties: props,
            mergedArea,
            mergedCount: mergedProps.length,
            mergedAverageArea: mergedArea / mergedProps.length
        })
    }
    
    return ownerMetrics
}

function calculateExchangeScore(
    owner1Metrics: OwnerMetrics,
    owner2Metrics: OwnerMetrics,
    prop1: Property,
    prop2: Property,
    areAdjacent: boolean
): number {
    // Simular troca sem criar novos arrays
    const newArea1 = owner1Metrics.totalArea - prop1.shapeArea + prop2.shapeArea
    const newArea2 = owner2Metrics.totalArea - prop2.shapeArea + prop1.shapeArea
    
    const oldAvg1 = owner1Metrics.averageArea
    const oldAvg2 = owner2Metrics.averageArea
    const newAvg1 = newArea1 / owner1Metrics.propertyCount
    const newAvg2 = newArea2 / owner2Metrics.propertyCount
    
    // If both averages would get worse or stay the same, return 0
    if (newAvg1 <= oldAvg1 && newAvg2 <= oldAvg2) {
        return 0
    }
    
    const areaImprovement = Math.abs(newAvg1 - oldAvg1) + Math.abs(newAvg2 - oldAvg2)
    const mergedAreaImprovement = Math.abs(newAvg1 - oldAvg1) * 1.5 // Estimativa simplificada para merged
    const sameFreguesia = prop1.freguesia === prop2.freguesia
    
    return (
        areaImprovement * 0.3 +
        mergedAreaImprovement * 0.4 +
        (sameFreguesia ? 0.2 : 0) +
        (areAdjacent ? 0.1 : 0)
    )
}

function findAdjacentOwners(
    property: Property,
    propertyGraph: Map<number, Set<number>>,
    properties: Property[]
): Set<number> {
    const adjacentOwners = new Set<number>()
    const neighbors = propertyGraph.get(property.objectId)
    if (!neighbors) return adjacentOwners

    const propertyMap = new Map(properties.map(p => [p.objectId, p]))
    for (const neighborId of neighbors) {
        const neighbor = propertyMap.get(neighborId)
        if (neighbor && neighbor.owner !== property.owner) {
            adjacentOwners.add(neighbor.owner)
        }
    }
    
    return adjacentOwners
}

export function suggestPropertyExchanges(
    properties: Property[],
    propertyGraph: Map<number, Set<number>>,
    maxSuggestions: number = 5,
    maxSuggestionsPerOwner: number = 2
): PropertyExchange[] {
    const suggestions: PropertyExchange[] = []
    const ownerMetrics = calculateInitialMetrics(properties, propertyGraph)
    const ownerSuggestionCount = new Map<number, number>()
    
    // Para cada propriedade
    for (const property of properties) {
        // Skip if owner already has max suggestions
        if ((ownerSuggestionCount.get(property.owner) || 0) >= maxSuggestionsPerOwner) {
            continue
        }
        
        // Encontrar owners adjacentes
        const adjacentOwners = findAdjacentOwners(property, propertyGraph, properties)
        
        for (const adjacentOwner of adjacentOwners) {
            // Skip if adjacent owner already has max suggestions
            if ((ownerSuggestionCount.get(adjacentOwner) || 0) >= maxSuggestionsPerOwner) {
                continue
            }
            
            const owner1Metrics = ownerMetrics.get(property.owner)!
            const owner2Metrics = ownerMetrics.get(adjacentOwner)!
            
            // Ordenar propriedades do owner adjacente por área (potencial de melhoria)
            const potentialProperties = owner2Metrics.properties
                .filter(p => propertyGraph.get(property.objectId)?.has(p.objectId))
                .sort((a, b) => Math.abs(b.shapeArea - property.shapeArea) - Math.abs(a.shapeArea - property.shapeArea))
                .slice(0, 5) // Limitar às 5 propriedades mais promissoras
            
            for (const prop2 of potentialProperties) {
                const areAdjacent = propertyGraph.get(property.objectId)?.has(prop2.objectId) || false
                const score = calculateExchangeScore(owner1Metrics, owner2Metrics, property, prop2, areAdjacent)
                
                if (score > 0) {
                    suggestions.push({
                        owner1: property.owner,
                        owner2: adjacentOwner,
                        property1: property,
                        property2: prop2,
                        areaImprovement: Math.abs(
                            (owner1Metrics.totalArea - property.shapeArea + prop2.shapeArea) / owner1Metrics.propertyCount -
                            owner1Metrics.averageArea
                        ) + Math.abs(
                            (owner2Metrics.totalArea - prop2.shapeArea + property.shapeArea) / owner2Metrics.propertyCount -
                            owner2Metrics.averageArea
                        ),
                        mergedAreaImprovement: score * 2, // Estimativa baseada no score
                        sameFreguesia: property.freguesia === prop2.freguesia,
                        totalScore: score
                    })
                    
                    // Update suggestion counts for both owners
                    ownerSuggestionCount.set(property.owner, (ownerSuggestionCount.get(property.owner) || 0) + 1)
                    ownerSuggestionCount.set(adjacentOwner, (ownerSuggestionCount.get(adjacentOwner) || 0) + 1)
                    
                    // Break if either owner reaches their limit
                    if ((ownerSuggestionCount.get(property.owner) || 0) >= maxSuggestionsPerOwner ||
                        (ownerSuggestionCount.get(adjacentOwner) || 0) >= maxSuggestionsPerOwner) {
                        break
                    }
                }
            }
        }
    }
    
    // Ordenar sugestões por score e limitar ao número máximo
    return suggestions
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, maxSuggestions)
} 