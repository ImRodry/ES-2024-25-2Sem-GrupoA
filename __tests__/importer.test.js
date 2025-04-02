"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const importer_1 = require("../src/importer");
let props;
beforeAll(() => {
    props = (0, importer_1.importCSV)("data/Madeira-Moodle-1.1.csv");
});
test("Validates correct entry", () => {
    const valid = {
        OBJECTID: 1,
        PAR_ID: 123456,
        PAR_NUM: 987654321,
        Shape_Length: 50.0,
        Shape_Area: 200.0,
        geometry: "MULTIPOLYGON(((...)))",
        OWNER: 123,
        Freguesia: "Teste",
        Municipio: "Cidade",
        Ilha: "Ilha"
    };
    const result = (0, importer_1.validateProperty)(valid);
    expect(result).not.toBeNull();
});
test("Detect invalid strings", () => {
    const invalid = {
        OBJECTID: 1,
        PAR_ID: 2,
        PAR_NUM: 3,
        Shape_Length: 4,
        Shape_Area: 5,
        geometry: "",
        OWNER: 6,
        Freguesia: "",
        Municipio: "",
        Ilha: ""
    };
    const result = (0, importer_1.validateProperty)(invalid);
    expect(result).toBeNull();
});
test("Detect invalid numbers", () => {
    const invalid = {
        OBJECTID: "abc",
        PAR_ID: "xyz",
        PAR_NUM: "NaN",
        Shape_Length: null,
        Shape_Area: undefined,
        geometry: "brotherwhaaat",
        OWNER: "seila",
        Freguesia: "x",
        Municipio: "y",
        Ilha: "z"
    };
    const result = (0, importer_1.validateProperty)(invalid);
    expect(result).toBeNull();
});
