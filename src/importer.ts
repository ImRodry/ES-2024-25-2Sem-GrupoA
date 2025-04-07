import { parse } from "csv-parse/sync"

export function parseCSV(csvString: string): RawProperty[] {
	const parsed: RawProperty[] = parse(csvString, {
		columns: line =>
			line.map((col: string) => col.toLowerCase().replace(/_(.)/g, (_, letter) => letter.toUpperCase())),
		skip_empty_lines: true,
		delimiter: ";",
	})

	return parsed
}

export function parseProperty(data: RawProperty): Property | null {
	const parsed: Property = {
		objectId: Number(data.objectid),
		parId: Number(data.parId),
		parNum: Number(String(data.parNum).replace(",", ".")),
		shapeLength: Number(data.shapeLength),
		shapeArea: Number(data.shapeArea),
		geometry:
			data.geometry
				.match(/\d+\.\d+ \d+\.\d+/g)
				?.map((coord: string) => coord.split(" ").map(Number) as [number, number]) ?? [],
		owner: Number(data.owner),
		freguesia: data.freguesia,
		municipio: data.municipio,
		ilha: data.ilha,
	}

	// Check if all numeric values are valid
	const anyInvalidNums = Object.entries(parsed).filter(([, n]) => typeof n === "number" && isNaN(n))
	if (anyInvalidNums.length) {
		console.log(
			"Invalid data (numbers): ",
			anyInvalidNums.map(([key]) => key)
		)
		return null
	}

	// Testa se as strings não sao vazias
	const anyInvalidStrings = Object.entries(parsed).filter(([, s]) => typeof s === "string" && s.length === 0)
	if (anyInvalidStrings.length) {
		console.log("Invalid data (string): ", anyInvalidStrings)
		return null
	}

	if (parsed.geometry.length === 0 || parsed.geometry.some(c => c.length !== 2 || c.some(isNaN))) {
		console.log("Invalid data (geometry): ", parsed.geometry)
		return null
	}

	return parsed
}

export interface Property {
	objectId: number
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

// Cria um tipo com as mesmas propriedades que Property, mas com os valores como string
// e objectid com casing diferente
export type RawProperty = {
	[K in keyof Omit<Property, "objectId">]: string
} & { objectid: string }
