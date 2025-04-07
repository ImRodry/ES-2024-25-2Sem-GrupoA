import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer"

const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))

console.log("Total number os properties: ")
console.log(rawProps.length)
