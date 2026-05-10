const makerjs = require('makerjs');

const svgPaths = "M 10 10 L 20 20 C 30 30 40 40 50 50 Z";

const model = makerjs.importer.fromSVGPathData(svgPaths);
const dxf = makerjs.exporter.toDXF(model);
console.log(dxf);
