import Graph from 'graphology'
import { Property } from './importer'

// Criar um grafo global
const graph = new Graph()

// Adicionar uma propriedade (nó) ao grafo
export function addProperty(property: Property) {
    graph.addNode(property.PAR_ID, {
        OBJECTID: property.OBJECTID,
        PAR_ID: property.PAR_ID,
        PAR_NUM: property.PAR_NUM,
        Shape_Length: property.Shape_Length,
        Shape_Area: property.Shape_Area,
        geometry: property.geometry,
        OWNER: property.OWNER,
        municipio: property.Municipio,
        ilha: property.Ilha,
        freguesia: property.Freguesia
    })
}

// Adicionar uma relação de adjacência entre dois nós
export function addAdjacency(parId1:number, parId2:number) {
    if (graph.hasNode(parId1) && graph.hasNode(parId2)) {
        graph.addEdge(parId1, parId2)
    }
}

// Função para imprimir o grafo
export function printGraph() {
    console.log(graph.export())
}

export { graph }
