import type { Property } from "./importer.js"

interface PropertyExchange {
    owner1: number
    owner2: number
    property1: Property
    property2: Property
    areaImprovement: number
    lengthImprovement: number
    sameFreguesia: boolean
    totalScore: number
}

function calculateAverageMetricsPerOwner(properties: Property[]): Map<number, { avgArea: number, avgLength: number }> {
    const ownerProperties = new Map<number, Property[]>()
    
    for (const property of properties) {
        if (!ownerProperties.has(property.owner)) {
            ownerProperties.set(property.owner, [])
        }
        ownerProperties.get(property.owner)!.push(property)
    }
    
    const ownerAverages = new Map<number, { avgArea: number, avgLength: number }>()
    for (const [owner, props] of ownerProperties) {
        const totalArea = props.reduce((sum, prop) => sum + prop.shapeArea, 0)
        const totalLength = props.reduce((sum, prop) => sum + prop.shapeLength, 0)
        ownerAverages.set(owner, {
            avgArea: totalArea / props.length,
            avgLength: totalLength / props.length
        })
    }
    
    return ownerAverages
}

export function suggestPropertyExchanges(properties: Property[], maxSuggestions: number = 5): PropertyExchange[] {
    const currentAverages = calculateAverageMetricsPerOwner(properties)
    const suggestions: PropertyExchange[] = []
    
    // Para cada par de proprietários
    const owners = [...new Set(properties.map(p => p.owner))]
    for (let i = 0; i < owners.length; i++) {
        const owner1 = owners[i]
        const owner1Properties = properties.filter(p => p.owner === owner1)
        
        for (let j = i + 1; j < owners.length; j++) {
            const owner2 = owners[j]
            const owner2Properties = properties.filter(p => p.owner === owner2)

            
            // Para cada par de propriedades entre esses proprietários
            for (const prop1 of owner1Properties) {
                for (const prop2 of owner2Properties) {
                    // Simula a troca
                    const newProperties = properties.map(p => {
                        if (p === prop1) return { ...p, owner: owner2 }
                        if (p === prop2) return { ...p, owner: owner1 }
                        return p
                    })
                    
                    const newAverages = calculateAverageMetricsPerOwner(newProperties)
                    
                    // melhoria da área
                    const areaImprovement = (
                        Math.abs(newAverages.get(owner1)!.avgArea - currentAverages.get(owner1)!.avgArea) +
                        Math.abs(newAverages.get(owner2)!.avgArea - currentAverages.get(owner2)!.avgArea)
                    )
                    
                    // melhoria do perímetro
                    const lengthImprovement = (
                        Math.abs(newAverages.get(owner1)!.avgLength - currentAverages.get(owner1)!.avgLength) +
                        Math.abs(newAverages.get(owner2)!.avgLength - currentAverages.get(owner2)!.avgLength)
                    )

                    // caractersitica 1 da freguesia
                    const sameFreguesia = prop1.freguesia === prop2.freguesia

                    // Cáluclo do score, um bocado arbitrário 
                    const totalScore = (
                        areaImprovement * 0.4 +  
                        lengthImprovement * 0.3 + 
                        (sameFreguesia ? 0.3 : 0)
                    )
                    
                    //Caso o total score seja positivo adiciona à sugestão
                    if (totalScore > 0) {
                        suggestions.push({
                            owner1,
                            owner2,
                            property1: prop1,
                            property2: prop2,
                            areaImprovement,
                            lengthImprovement,
                            sameFreguesia,
                            totalScore
                        })
                    }
                }
            }
        }
    }
    

    return suggestions
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, maxSuggestions)
} 