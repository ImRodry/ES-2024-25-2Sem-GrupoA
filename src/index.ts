import { importCSV } from "./importer"
import { PropertyGraph } from "./PropertyGraph"

const properties = importCSV("data/Madeira-Moodle-1.1.csv")


console.log("Total number os properties: ")
console.log(properties.length)


const propertyGraph = new PropertyGraph()

properties.forEach(prop => propertyGraph.addProperty(prop))

for (let i = 0; i < properties.length - 1; i++) {
    propertyGraph.addAdjacency(properties[i].PAR_ID, properties[i + 1].PAR_ID)
}
propertyGraph.printGraph()
