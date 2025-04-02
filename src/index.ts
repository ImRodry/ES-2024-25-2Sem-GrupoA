import { importCSV } from "./importer"
import { addProperty, addAdjacency, printGraph } from "./graph"

// Importar propriedades do CSV
const properties = importCSV("data/Madeira-Moodle-1.1.csv")

console.log("Total number of properties:", properties.length)

// Adicionar propriedades ao grafo
properties.forEach(property => {
    addProperty(property)
})

// Adicionar algumas relações de adjacência para testar
if (properties.length > 1) {
    for (let i = 0; i < properties.length - 1; i++) {
        addAdjacency(properties[i].PAR_ID, properties[i + 1].PAR_ID)
    }
}

// Imprimir o grafo para verificação
printGraph()