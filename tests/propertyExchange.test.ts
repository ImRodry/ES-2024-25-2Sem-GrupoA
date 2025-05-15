import { describe, it } from "node:test"
import assert from "node:assert"
import { suggestPropertyExchanges } from "../src/propertyExchange.js"
import type { Property } from "../src/importer.js"

describe("Testes de Troca de Propriedades", () => {
    it("deve sugerir trocas de propriedades que melhorem múltiplas características", () => {
        const properties: Property[] = [
            // Proprietário 1: média atual área = 150, comprimento = 40
            {
                objectId: 1,
                parId: 1,
                parNum: 1,
                shapeLength: 40,
                shapeArea: 100,
                geometry: [[0, 0], [1, 0], [1, 1], [0, 1]],
                owner: 1,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            {
                objectId: 2,
                parId: 2,
                parNum: 2,
                shapeLength: 40,
                shapeArea: 200,
                geometry: [[1, 0], [2, 0], [2, 1], [1, 1]],
                owner: 1,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            // Proprietário 2: média atual área = 300, comprimento = 50
            {
                objectId: 3,
                parId: 3,
                parNum: 3,
                shapeLength: 60,
                shapeArea: 400,
                geometry: [[2, 0], [3, 0], [3, 1], [2, 1]],
                owner: 2,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            {
                objectId: 4,
                parId: 4,
                parNum: 4,
                shapeLength: 40,
                shapeArea: 200,
                geometry: [[3, 0], [4, 0], [4, 1], [3, 1]],
                owner: 2,
                freguesia: "Freguesia B",
                municipio: "Município X",
                ilha: "Ilha Y"
            }
        ]

        const suggestions = suggestPropertyExchanges(properties)
        
        assert.ok(suggestions.length > 0, "Deve retornar pelo menos uma sugestão")
        const suggestion = suggestions[0]
        
        // Verifica se a sugestão tem todas as novas propriedades
        assert.ok('areaImprovement' in suggestion, "Deve incluir melhoria de área")
        assert.ok('lengthImprovement' in suggestion, "Deve incluir melhoria de perímetro")
        assert.ok('sameFreguesia' in suggestion, "Deve incluir comparação de freguesia")
        assert.ok('totalScore' in suggestion, "Deve incluir pontuação total")
        
        // Verifica se a pontuação total é positiva
        assert.ok(suggestion.totalScore > 0, "Deve ter pontuação total positiva")
        
        // Verifica se os proprietários são diferentes
        assert.notStrictEqual(suggestion.owner1, suggestion.owner2, "Deve sugerir troca entre proprietários diferentes")
    })

    it("deve preferir trocas dentro da mesma freguesia", () => {
        const properties: Property[] = [
            {
                objectId: 1,
                parId: 1,
                parNum: 1,
                shapeLength: 40,
                shapeArea: 100,
                geometry: [[0, 0], [1, 0], [1, 1], [0, 1]],
                owner: 1,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            {
                objectId: 2,
                parId: 2,
                parNum: 2,
                shapeLength: 40,
                shapeArea: 200,
                geometry: [[1, 0], [2, 0], [2, 1], [1, 1]],
                owner: 2,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            {
                objectId: 3,
                parId: 3,
                parNum: 3,
                shapeLength: 40,
                shapeArea: 200,
                geometry: [[2, 0], [3, 0], [3, 1], [2, 1]],
                owner: 3,
                freguesia: "Freguesia B",
                municipio: "Município X",
                ilha: "Ilha Y"
            }
        ]

        const suggestions = suggestPropertyExchanges(properties)
        
        // Verifica se a primeira sugestão é entre propriedades da mesma freguesia
        if (suggestions.length > 0) {
            const firstSuggestion = suggestions[0]
            assert.ok(firstSuggestion.sameFreguesia, "A primeira sugestão deve ser dentro da mesma freguesia")
        }
    })

    it("deve retornar array vazio quando não houver trocas benéficas possíveis", () => {
        const properties: Property[] = [
            {
                objectId: 1,
                parId: 1,
                parNum: 1,
                shapeLength: 40,
                shapeArea: 100,
                geometry: [[0, 0], [1, 0], [1, 1], [0, 1]],
                owner: 1,
                freguesia: "Freguesia A",
                municipio: "Município X",
                ilha: "Ilha Y"
            },
            {
                objectId: 2,
                parId: 2,
                parNum: 2,
                shapeLength: 40,
                shapeArea: 100,
                geometry: [[1, 0], [2, 0], [2, 1], [1, 1]],
                owner: 2,
                freguesia: "Freguesia B",
                municipio: "Município X",
                ilha: "Ilha Y"
            }
        ]

        const suggestions = suggestPropertyExchanges(properties)
        assert.strictEqual(suggestions.length, 0, "Deve retornar sem sugestões quando não existirem trocas benéficas")
    })
}) 