import { readFileSync } from "node:fs"
import { parse } from "csv-parse/sync"

const file = readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8")

function readCSV(filepath: string) {
	const content = readFileSync(filepath, "utf-8")
	const records = parse(content, {
		columns: true, 
		skip_empty_lines: true,
		delimiter: ";"
	  })
	return records
}

const data = readCSV("data/Madeira-Moodle-1.1.csv")
console.log(data[0])