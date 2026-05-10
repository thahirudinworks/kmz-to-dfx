import type { MarkerIconRule } from "@/types/map";

type DxfMode = "legacy" | "modern";

type GenerateDxfParams = {
  geoData: any;
  buildingData: any;
  roadData: any;
  markerIconRules: MarkerIconRule[];
  mode?: DxfMode;
};

let CENTER_X = 0;
let CENTER_Y = 0;

// ukuran dalam METER
const ICON_SCALE = 0.25;
const CIRCLE_RADIUS = 1.2;
const TEXT_HEIGHT = 1.5;
const TEXT_OFFSET_METER = 2.2;

const EARTH_RADIUS = 6378137;

const lngToMeter = (lng: number) => {
  return (lng * Math.PI * EARTH_RADIUS) / 180;
};

const latToMeter = (lat: number) => {
  const rad = (lat * Math.PI) / 180;
  return EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const n = (value: any) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return Number(num.toFixed(6)).toString();
};

const nx = (lng: number) => n(lngToMeter(Number(lng)) - CENTER_X);
const ny = (lat: number) => n(latToMeter(Number(lat)) - CENTER_Y);

const pair = (code: string | number, value: string | number): string[] => {
  return [String(code), String(value)];
};

const append = (target: string[], source: string[]) => {
  for (const item of source) {
    if (item !== undefined && item !== null) target.push(item);
  }
};

const cleanText = (value: any): string => {
  return String(value || "MARKER")
    .replace(/\r?\n/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .substring(0, 255);
};

const getFeatureName = (feature: any): string => {
  return cleanText(
    feature?.properties?.name ||
      feature?.properties?.Name ||
      feature?.properties?.title ||
      feature?.properties?.description ||
      "MARKER",
  );
};

const getMarkerRule = (name: string, rules: MarkerIconRule[]) => {
  return rules.find((rule) =>
    name.toLowerCase().startsWith(rule.namePrefix.toLowerCase()),
  );
};

const extractFirstCoordinate = (data: any): [number, number] | null => {
  const features = data?.features || [];

  for (const feature of features) {
    const geometry = feature?.geometry;
    if (!geometry) continue;

    const c = geometry.coordinates;

    if (geometry.type === "Point") return [Number(c?.[0]), Number(c?.[1])];
    if (geometry.type === "LineString")
      return [Number(c?.[0]?.[0]), Number(c?.[0]?.[1])];
    if (geometry.type === "Polygon")
      return [Number(c?.[0]?.[0]?.[0]), Number(c?.[0]?.[0]?.[1])];
    if (geometry.type === "MultiLineString")
      return [Number(c?.[0]?.[0]?.[0]), Number(c?.[0]?.[0]?.[1])];
    if (geometry.type === "MultiPolygon")
      return [Number(c?.[0]?.[0]?.[0]?.[0]), Number(c?.[0]?.[0]?.[0]?.[1])];
  }

  return null;
};

const setCenterFromData = (geoData: any, buildingData: any, roadData: any) => {
  const coordinate =
    extractFirstCoordinate(geoData) ||
    extractFirstCoordinate(buildingData) ||
    extractFirstCoordinate(roadData);

  if (!coordinate) {
    CENTER_X = 0;
    CENTER_Y = 0;
    return;
  }

  CENTER_X = lngToMeter(Number(coordinate[0]));
  CENTER_Y = latToMeter(Number(coordinate[1]));
};

const createHeaderSection = (mode: DxfMode): string[] => {
  const ver = mode === "modern" ? "AC1015" : "AC1009";

  return [
    ...pair(0, "SECTION"),
    ...pair(2, "HEADER"),

    ...pair(9, "$ACADVER"),
    ...pair(1, ver),

    ...pair(9, "$INSBASE"),
    ...pair(10, "0.0"),
    ...pair(20, "0.0"),
    ...pair(30, "0.0"),

    ...pair(9, "$EXTMIN"),
    ...pair(10, "-100000.0"),
    ...pair(20, "-100000.0"),
    ...pair(30, "0.0"),

    ...pair(9, "$EXTMAX"),
    ...pair(10, "100000.0"),
    ...pair(20, "100000.0"),
    ...pair(30, "0.0"),

    ...pair(9, "$LIMMIN"),
    ...pair(10, "-100000.0"),
    ...pair(20, "-100000.0"),

    ...pair(9, "$LIMMAX"),
    ...pair(10, "100000.0"),
    ...pair(20, "100000.0"),

    ...pair(9, "$LTSCALE"),
    ...pair(40, "1.0"),

    ...pair(9, "$TEXTSTYLE"),
    ...pair(7, "STANDARD"),

    ...pair(9, "$CLAYER"),
    ...pair(8, "0"),

    ...pair(9, "$CELTYPE"),
    ...pair(6, "BYLAYER"),

    ...pair(9, "$CECOLOR"),
    ...pair(62, "256"),

    // 6 = meters
    ...pair(9, "$INSUNITS"),
    ...pair(70, "6"),

    ...pair(0, "ENDSEC"),
  ];
};

const LAYERS = [
  { name: "0", color: 7 },
  { name: "POLYGON", color: 3 },
  { name: "BUILDING", color: 2 },
  { name: "ROAD", color: 4 },
  { name: "MARKER", color: 1 },
  { name: "MARKER_ICON", color: 1 },
  { name: "MARKER_LABEL", color: 7 },
];

const createTablesSection = (): string[] => {
  const lines: string[] = [];

  append(lines, pair(0, "SECTION"));
  append(lines, pair(2, "TABLES"));

  append(lines, pair(0, "TABLE"));
  append(lines, pair(2, "LTYPE"));
  append(lines, pair(70, "1"));
  append(lines, pair(0, "LTYPE"));
  append(lines, pair(2, "CONTINUOUS"));
  append(lines, pair(70, "0"));
  append(lines, pair(3, "Solid line"));
  append(lines, pair(72, "65"));
  append(lines, pair(73, "0"));
  append(lines, pair(40, "0.0"));
  append(lines, pair(0, "ENDTAB"));

  append(lines, pair(0, "TABLE"));
  append(lines, pair(2, "LAYER"));
  append(lines, pair(70, String(LAYERS.length)));

  for (const layer of LAYERS) {
    append(lines, pair(0, "LAYER"));
    append(lines, pair(2, layer.name));
    append(lines, pair(70, "0"));
    append(lines, pair(62, String(layer.color)));
    append(lines, pair(6, "CONTINUOUS"));
  }

  append(lines, pair(0, "ENDTAB"));

  append(lines, pair(0, "TABLE"));
  append(lines, pair(2, "STYLE"));
  append(lines, pair(70, "1"));
  append(lines, pair(0, "STYLE"));
  append(lines, pair(2, "STANDARD"));
  append(lines, pair(70, "0"));
  append(lines, pair(40, "0.0"));
  append(lines, pair(41, "1.0"));
  append(lines, pair(50, "0.0"));
  append(lines, pair(71, "0"));
  append(lines, pair(42, String(TEXT_HEIGHT)));
  append(lines, pair(3, "txt"));
  append(lines, pair(4, ""));
  append(lines, pair(0, "ENDTAB"));

  append(lines, pair(0, "TABLE"));
  append(lines, pair(2, "APPID"));
  append(lines, pair(70, "1"));
  append(lines, pair(0, "APPID"));
  append(lines, pair(2, "ACAD"));
  append(lines, pair(70, "0"));
  append(lines, pair(0, "ENDTAB"));

  append(lines, pair(0, "TABLE"));
  append(lines, pair(2, "DIMSTYLE"));
  append(lines, pair(70, "1"));
  append(lines, pair(0, "DIMSTYLE"));
  append(lines, pair(2, "STANDARD"));
  append(lines, pair(70, "0"));
  append(lines, pair(3, ""));
  append(lines, pair(4, ""));
  append(lines, pair(5, ""));
  append(lines, pair(6, ""));
  append(lines, pair(7, ""));
  append(lines, pair(40, "1.0"));
  append(lines, pair(41, "0.18"));
  append(lines, pair(42, "0.0625"));
  append(lines, pair(43, "0.38"));
  append(lines, pair(44, "0.18"));
  append(lines, pair(45, "0.0"));
  append(lines, pair(46, "0.0"));
  append(lines, pair(47, "0.0"));
  append(lines, pair(48, "0.0"));
  append(lines, pair(71, "0"));
  append(lines, pair(72, "0"));
  append(lines, pair(73, "1"));
  append(lines, pair(74, "1"));
  append(lines, pair(75, "0"));
  append(lines, pair(76, "0"));
  append(lines, pair(77, "0"));
  append(lines, pair(78, "0"));
  append(lines, pair(0, "ENDTAB"));

  append(lines, pair(0, "ENDSEC"));

  return lines;
};

const createBlocksSection = (): string[] => {
  return [
    ...pair(0, "SECTION"),
    ...pair(2, "BLOCKS"),

    ...pair(0, "BLOCK"),
    ...pair(8, "0"),
    ...pair(2, "*MODEL_SPACE"),
    ...pair(70, "0"),
    ...pair(10, "0.0"),
    ...pair(20, "0.0"),
    ...pair(30, "0.0"),
    ...pair(3, "*MODEL_SPACE"),
    ...pair(1, ""),
    ...pair(0, "ENDBLK"),
    ...pair(8, "0"),

    ...pair(0, "BLOCK"),
    ...pair(8, "0"),
    ...pair(2, "*PAPER_SPACE"),
    ...pair(70, "0"),
    ...pair(10, "0.0"),
    ...pair(20, "0.0"),
    ...pair(30, "0.0"),
    ...pair(3, "*PAPER_SPACE"),
    ...pair(1, ""),
    ...pair(0, "ENDBLK"),
    ...pair(8, "0"),

    ...pair(0, "ENDSEC"),
  ];
};

const meterX = (lng: number) => lngToMeter(Number(lng)) - CENTER_X;
const meterY = (lat: number) => latToMeter(Number(lat)) - CENTER_Y;

const createSolidMeter = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  layer = "MARKER_ICON",
  color = 1,
): string[] => {
  return [
    ...pair(0, "SOLID"),
    ...pair(8, layer),
    ...pair(62, String(color)),

    ...pair(10, n(x1)),
    ...pair(20, n(y1)),
    ...pair(30, "0.0"),

    ...pair(11, n(x2)),
    ...pair(21, n(y2)),
    ...pair(31, "0.0"),

    ...pair(12, n(x4)),
    ...pair(22, n(y4)),
    ...pair(32, "0.0"),

    ...pair(13, n(x3)),
    ...pair(23, n(y3)),
    ...pair(33, "0.0"),
  ];
};

const createIconAtPoint = (
  lng: number,
  lat: number,
  rule: MarkerIconRule,
): string[] => {
  const lines: string[] = [];

  const baseX = meterX(lng);
  const baseY = meterY(lat);

  for (const cell of rule.dxfCells || []) {
    const x = baseX + Number(cell.x) * ICON_SCALE;
    const y = baseY + Number(cell.y) * ICON_SCALE;
    const size = Number(cell.size) * ICON_SCALE;

    append(
      lines,
      createSolidMeter(
        x,
        y,
        x + size,
        y,
        x + size,
        y + size,
        x,
        y + size,
        "MARKER_ICON",
        cell.color ?? 1,
      ),
    );
  }

  return lines;
};

const createCircleMarker = (lng: number, lat: number): string[] => {
  return [
    ...pair(0, "CIRCLE"),
    ...pair(8, "MARKER"),
    ...pair(62, "1"),
    ...pair(10, nx(lng)),
    ...pair(20, ny(lat)),
    ...pair(30, "0.0"),
    ...pair(40, String(CIRCLE_RADIUS)),
  ];
};

const createTextMeter = (
  text: string,
  xMeter: number,
  yMeter: number,
  height = TEXT_HEIGHT,
  layer = "MARKER_LABEL",
): string[] => {
  return [
    ...pair(0, "TEXT"),
    ...pair(8, layer),
    ...pair(62, "7"),
    ...pair(10, n(xMeter)),
    ...pair(20, n(yMeter)),
    ...pair(30, "0.0"),
    ...pair(40, n(height)),
    ...pair(1, cleanText(text)),
    ...pair(50, "0.0"),
    ...pair(7, "STANDARD"),
  ];
};

const createMarkerLabel = (
  name: string,
  lng: number,
  lat: number,
): string[] => {
  const x = meterX(lng);
  const y = meterY(lat) - TEXT_OFFSET_METER;

  return createTextMeter(name, x, y);
};

const createLegacyPolyline = (
  coordinates: number[][],
  layer = "POLYGON",
  closed = false,
): string[] => {
  if (!coordinates || coordinates.length < 2) return [];

  const validCoords = coordinates.filter((c) => {
    const lng = Number(c?.[0]);
    const lat = Number(c?.[1]);
    return Number.isFinite(lng) && Number.isFinite(lat);
  });

  if (validCoords.length < 2) return [];

  const lines: string[] = [];

  append(lines, pair(0, "POLYLINE"));
  append(lines, pair(8, layer));
  append(lines, pair(66, "1"));
  append(lines, pair(10, "0.0"));
  append(lines, pair(20, "0.0"));
  append(lines, pair(30, "0.0"));
  append(lines, pair(70, closed ? "1" : "0"));

  for (const c of validCoords) {
    append(lines, pair(0, "VERTEX"));
    append(lines, pair(8, layer));
    append(lines, pair(10, nx(Number(c[0]))));
    append(lines, pair(20, ny(Number(c[1]))));
    append(lines, pair(30, "0.0"));
    append(lines, pair(70, "0"));
  }

  append(lines, pair(0, "SEQEND"));
  append(lines, pair(8, layer));

  return lines;
};

const createModernPolyline = (
  coordinates: number[][],
  layer = "POLYGON",
  closed = false,
): string[] => {
  const validCoords =
    coordinates?.filter((c) => {
      const lng = Number(c?.[0]);
      const lat = Number(c?.[1]);
      return Number.isFinite(lng) && Number.isFinite(lat);
    }) || [];

  if (validCoords.length < 2) return [];

  const lines: string[] = [];

  append(lines, pair(0, "LWPOLYLINE"));
  append(lines, pair(8, layer));
  append(lines, pair(90, String(validCoords.length)));
  append(lines, pair(70, closed ? "1" : "0"));
  append(lines, pair(43, "0.0"));

  for (const c of validCoords) {
    append(lines, pair(10, nx(Number(c[0]))));
    append(lines, pair(20, ny(Number(c[1]))));
  }

  return lines;
};

const createPolyline = (
  coordinates: number[][],
  layer = "POLYGON",
  closed = false,
  mode: DxfMode,
): string[] => {
  return mode === "modern"
    ? createModernPolyline(coordinates, layer, closed)
    : createLegacyPolyline(coordinates, layer, closed);
};

const createPolygon = (
  coordinates: number[][],
  layer = "POLYGON",
  mode: DxfMode,
): string[] => {
  if (!coordinates || coordinates.length < 3) return [];
  return createPolyline(coordinates, layer, true, mode);
};

const createFeatureEntity = (
  feature: any,
  markerIconRules: MarkerIconRule[],
  defaultLayer: string,
  mode: DxfMode,
): string[] => {
  const geometry = feature?.geometry;
  const properties = feature?.properties || {};

  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;
  const layer = cleanText(properties.layer || defaultLayer);

  if (type === "Point") {
    const lng = Number(coordinates?.[0]);
    const lat = Number(coordinates?.[1]);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [];

    const name = getFeatureName(feature);
    const rule = getMarkerRule(name, markerIconRules);

    const lines: string[] = [];

    if (rule && rule.dxfCells && rule.dxfCells.length > 0) {
      append(lines, createIconAtPoint(lng, lat, rule));
    } else {
      append(lines, createCircleMarker(lng, lat));
    }

    append(lines, createMarkerLabel(name, lng, lat));

    return lines;
  }

  if (type === "LineString") {
    return createPolyline(coordinates, layer, false, mode);
  }

  if (type === "Polygon") {
    const lines: string[] = [];

    for (const ring of coordinates || []) {
      append(lines, createPolygon(ring, layer, mode));
    }

    return lines;
  }

  if (type === "MultiLineString") {
    const lines: string[] = [];

    for (const line of coordinates || []) {
      append(lines, createPolyline(line, layer, false, mode));
    }

    return lines;
  }

  if (type === "MultiPolygon") {
    const lines: string[] = [];

    for (const polygon of coordinates || []) {
      for (const ring of polygon || []) {
        append(lines, createPolygon(ring, layer, mode));
      }
    }

    return lines;
  }

  return [];
};

const createFeatureCollectionEntities = (
  data: any,
  markerIconRules: MarkerIconRule[],
  defaultLayer: string,
  mode: DxfMode,
): string[] => {
  const lines: string[] = [];

  for (const feature of data?.features || []) {
    append(
      lines,
      createFeatureEntity(feature, markerIconRules, defaultLayer, mode),
    );
  }

  return lines;
};

export const generateDxfContent = ({
  geoData,
  buildingData,
  roadData,
  markerIconRules,
  mode = "legacy",
}: GenerateDxfParams): string => {
  setCenterFromData(geoData, buildingData, roadData);

  const lines: string[] = [];

  append(lines, createHeaderSection(mode));
  append(lines, createTablesSection());
  append(lines, createBlocksSection());

  append(lines, pair(0, "SECTION"));
  append(lines, pair(2, "ENTITIES"));

  append(
    lines,
    createFeatureCollectionEntities(geoData, markerIconRules, "POLYGON", mode),
  );
  append(
    lines,
    createFeatureCollectionEntities(
      buildingData,
      markerIconRules,
      "BUILDING",
      mode,
    ),
  );
  append(
    lines,
    createFeatureCollectionEntities(roadData, markerIconRules, "ROAD", mode),
  );

  append(lines, pair(0, "ENDSEC"));
  append(lines, pair(0, "EOF"));

  return lines.join("\r\n") + "\r\n";
};

export const downloadDxfFile = (
  content: string,
  filename = "map-export.dxf",
): void => {
  const blob = new Blob([content], {
    type: "application/dxf;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
