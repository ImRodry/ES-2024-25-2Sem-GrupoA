import Graph from 'graphology'  // Biblioteca para manipular grafos
import { Property } from './importer'

export class PropertyGraph {
    private graph: Graph

    constructor() {
        this.graph = new Graph()  // Cria um novo grafo
    }

    // Adiciona propriedades (nós) ao grafo
    addProperty(property: Property) {
        this.graph.addNode(property.PAR_ID, {
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
    

    // Adiciona uma relação de adjacência entre duas propriedades (nós)
    addAdjacency(parId1: number, parId2: number) {
        if (this.graph.hasNode(parId1) && this.graph.hasNode(parId2)) {
            this.graph.addEdge(parId1, parId2)
        }
    }

    // Mostrar o grafo
    printGraph() {
        console.log(this.graph.export())
    }
}
