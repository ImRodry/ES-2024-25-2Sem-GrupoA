import { readFileSync } from "node:fs"
import { parse } from "csv-parse/sync"

export interface Property {
    OBJECTID: number
    PAR_ID: number
    PAR_NUM: number
    Shape_Length: number
    Shape_Area: number
    geometry: string
    OWNER: number
    Freguesia: string
    Municipio: string
    Ilha: string
}

export function validateProperty(data: any): Property | null {
    const parsed = {
        OBJECTID: Number(data.OBJECTID),
        PAR_ID: Number(data.PAR_ID),
        PAR_NUM: Number(String(data.PAR_NUM).replace(",", ".")),
        Shape_Length: Number(data.Shape_Length),
        Shape_Area: Number(data.Shape_Area),
        geometry: data.geometry,
        OWNER: Number(data.OWNER),
        Freguesia: data.Freguesia,
        Municipio: data.Municipio,
        Ilha: data.Ilha
    }

    //Testa os valores numericos das propriedades
    const numeros = [ 
        parsed.OBJECTID,
        parsed.PAR_ID,
        parsed.PAR_NUM,
        parsed.Shape_Length,
        parsed.Shape_Area,
        parsed.OWNER
    ]

    const anyInvalid = numeros.some(n => isNaN(n))
    if (anyInvalid) {
        console.log("Invalid data (numbers):")
        return null
    }

    //Teste se as strings n sao vazias
    const strings = [
        parsed.geometry,
        parsed.Freguesia,
        parsed.Municipio,
        parsed.Ilha
      ]
    
      if (strings.some(s => !s || s.length === 0)) {
        console.log("Invalid data (string):")
        return null
      }

    return parsed
}


export function importCSV(path: string): Property[] {
    const content = readFileSync(path, "utf-8")
    const register = parse(content, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ";"
    })

    const property: Property[] = []

    for (const reg of register) {
        const prop = validateProperty(reg)
        //console.log(prop?.PAR_NUM)
        if (prop) property.push(prop)
    }

    return property
}

