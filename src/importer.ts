import { readFileSync } from "node:fs"
import { parse } from "csv-parse/sync"

export function parseProperty(data: any): Property | null {
	const parsed = {
		objectid: Number(data.objectid),
		parId: Number(data.parId),
		parNum: Number(String(data.parNum).replace(",", ".")),
		shapeLength: Number(data.shapeLength),
		shapeArea: Number(data.shapeArea),
		geometry: data.geometry.match(/\d+\.\d+ \d+\.\d+/g).map((coord: string) => coord.split(" ").map(Number)),
		owner: Number(data.owner),
		freguesia: data.freguesia,
		municipio: data.municipio,
		ilha: data.ilha,
	}

	//Testa os valores numericos das propriedades
	const numeros = [parsed.objectid, parsed.parId, parsed.parNum, parsed.shapeLength, parsed.shapeArea, parsed.owner]

	const anyInvalidNums = numeros.filter(n => isNaN(n))
	if (anyInvalidNums.length) {
		console.log("Invalid data (numbers): ", anyInvalidNums)
		return null
	}

	//Teste se as strings n sao vazias
	const strings = [parsed.geometry, parsed.freguesia, parsed.municipio, parsed.ilha],
		anyInvalidStrings = strings.filter(s => !s || s.length === 0)

	if (anyInvalidStrings.length) {
		console.log("Invalid data (string): ", anyInvalidStrings)
		return null
	}

	return parsed
}

export function importCSV(path: string): Property[] {
	const content = readFileSync(path, "utf-8")
	const register = parse(content, {
		columns: line =>
			line.map((col: string) => col.toLowerCase().replace(/_(.)/g, (_, letter) => letter.toUpperCase())),
		skip_empty_lines: true,
		delimiter: ";",
	})

	const property: Property[] = []

	for (const reg of register) {
		const prop = parseProperty(reg)
		//console.log(prop?.PAR_NUM)
		if (prop) property.push(prop)
	}

	return property
}

export interface Property {
	objectid: number
	parId: number
	parNum: number
	shapeLength: number
	shapeArea: number
	geometry: [number, number][]
	owner: number
	freguesia: string
	municipio: string
	ilha: string
}
