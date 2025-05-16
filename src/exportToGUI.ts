import { parseCSV, parseProperty, Property } from "./importer.ts"
import { writeFileSync } from "fs"
import proj4 from "proj4"

proj4.defs("EPSG:3763", "+proj=utm +zone=28 +ellps=intl +units=m +no_defs")

function convertGeometry(coords: [number, number][]): [number, number][] {
	return coords.map(([x, y]) => {
		const [lon, lat] = proj4("EPSG:3763", "WGS84", [x, y])
		return [lon, lat]
	})
}

const CSV_PATH = "data/Madeira-Moodle-1.1.csv"

try {
	const allProperties: Property[] = parseCSV(CSV_PATH)
		.map(parseProperty)
		.filter(p => p !== null)
	console.log(`Total importado: ${allProperties.length}`)

	const properties = allProperties.slice(0, 500)

	const propertiesForGUI = properties.map(p => ({
		objectId: p.objectId,
		geometry: convertGeometry(p.geometry),
		owner: p.owner,
		freguesia: p.freguesia,
		municipio: p.municipio,
	}))

	writeFileSync("Visualizador/propriedades.json", JSON.stringify(propertiesForGUI, null, 2))
} catch (error) {
	console.error("Erro ao gerar JSON para GUI:", error)
}
