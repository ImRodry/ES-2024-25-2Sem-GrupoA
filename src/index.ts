import { importCSV } from "./importer"

const properties = importCSV("data/Madeira-Moodle-1.1.csv")

console.log("Total number os properties: ")
console.log(properties.length)
