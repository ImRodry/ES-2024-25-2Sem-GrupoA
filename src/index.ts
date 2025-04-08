import { readFileSync } from "node:fs"
import { parseCSV, parseProperty, Property } from "./importer"

const rawProps = parseCSV(readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8"))

const properties: Property[] = []
for (const rawProp of rawProps) {
	const prop = parseProperty(rawProp)
	if (prop) properties.push(prop)
}

console.log("Total number os properties: ")
console.log(rawProps.length)
