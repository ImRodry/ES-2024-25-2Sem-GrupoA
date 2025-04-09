import { parse } from "csv-parse/sync"

/**
 * Takes a CSV string and parses it into an array of objects. It also maps the property key to camelCase.
 * @param csvString CSV string to parse
 * @returns Array of properties as they were parsed from the CSV without any further processing
 */
export function parseCSV(csvString: string): RawProperty[] {
	const parsed: RawProperty[] = parse(csvString, {
		columns: line =>
			line.map((col: string) => col.toLowerCase().replace(/_(.)/g, (_, letter) => letter.toUpperCase())),
		skip_empty_lines: true,
		delimiter: ";",
	})

	return parsed
}

/**
 * Converts the object received from the CSV into a Property object, while also checking its integrity.
 * If any field is malformed, the data is considered invalid and an error message is printed.
 * @param data RawProperty object to parse as it was received from the CSV
 * @returns Parsed Property object or null if the data is invalid
 */
export function parseProperty(data: RawProperty): Property | null {
	const parsed: Property = {
			objectId: Number(data.objectid),
			parId: Number(data.parId),
			parNum: Number(String(data.parNum).replace(",", ".")),
			shapeLength: Number(data.shapeLength),
			shapeArea: Number(data.shapeArea),
			geometry:
				data.geometry
					.match(/(?<=, |\()\d+\.\d+ \d+\.\d+(?=,|\))/g)
					?.map((coord: string) => coord.split(" ").map(Number) as [number, number]) ?? [],
			owner: Number(data.owner),
			freguesia: data.freguesia,
			municipio: data.municipio,
			ilha: data.ilha,
		},
		entries = Object.entries(parsed)

	const anyInvalidNums = entries.filter(([, n]) => typeof n === "number" && isNaN(n))
	if (anyInvalidNums.length) {
		console.log(
			"Invalid data (numbers): ",
			anyInvalidNums.map(([key]) => key)
		)
		return null
	}

	const anyInvalidStrings = entries.filter(([, s]) => typeof s === "string" && !s.trim())
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

/**
 * Object representing a property as well as its geometry and relevant data, parsed from the CSV.
 */
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

/**
 * Object parsed from the CSV file, to be converted into a Property object.
 */
export type RawProperty = {
	[K in keyof Omit<Property, "objectId">]: string
} & { objectid: string }
