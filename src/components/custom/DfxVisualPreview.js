import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getFeatureName } from '@/utils/geojson';
import { getIconRuleByName } from '@/utils/marker';
const DxfVisualPreview = ({ geoData, buildingData, roadData, markerIconRules, }) => {
    const allFeatures = [
        ...(geoData?.features || []),
        ...(buildingData?.features || []),
        ...(roadData?.features || []),
    ];
    const coords = [];
    const collectCoords = (coordinate) => {
        if (!coordinate)
            return;
        if (Array.isArray(coordinate) &&
            typeof coordinate[0] === 'number' &&
            typeof coordinate[1] === 'number') {
            coords.push(coordinate);
            return;
        }
        if (Array.isArray(coordinate)) {
            coordinate.forEach(collectCoords);
        }
    };
    allFeatures.forEach((feature) => {
        collectCoords(feature.geometry?.coordinates);
    });
    if (coords.length === 0) {
        return (_jsx("div", { className: "h-full flex items-center justify-center text-white text-sm", children: "Belum ada data untuk preview DXF." }));
    }
    const lngs = coords.map((coord) => coord[0]);
    const lats = coords.map((coord) => coord[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const width = 1400;
    const height = 900;
    const padding = 80;
    const scaleX = (width - padding * 2) / Math.max(maxLng - minLng, 0.000001);
    const scaleY = (height - padding * 2) / Math.max(maxLat - minLat, 0.000001);
    const scale = Math.min(scaleX, scaleY);
    const project = (coord) => {
        const [lng, lat] = coord;
        return {
            x: padding + (lng - minLng) * scale,
            y: height - padding - (lat - minLat) * scale,
        };
    };
    const linePath = (coordinates, close = false) => {
        if (!coordinates || coordinates.length === 0)
            return '';
        const points = coordinates.map(project);
        const d = points
            .map((point, index) => {
            return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        })
            .join(' ');
        return close ? `${d} Z` : d;
    };
    const renderLine = (coordinates, key, stroke, strokeWidth = 2) => {
        return (_jsx("path", { d: linePath(coordinates, false), fill: "none", stroke: stroke, strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" }, key));
    };
    const renderPolygon = (coordinates, key, stroke, fill, strokeWidth = 1.5, opacity = 0.35) => {
        return coordinates.map((ring, ringIndex) => (_jsx("path", { d: linePath(ring, true), fill: fill, fillOpacity: opacity, stroke: stroke, strokeWidth: strokeWidth, strokeLinejoin: "round" }, `${key}-${ringIndex}`)));
    };
    const renderMarker = (feature, key) => {
        const coordinates = feature.geometry?.coordinates;
        const name = getFeatureName(feature) || 'Marker';
        const matchedRule = getIconRuleByName(name, markerIconRules);
        if (!coordinates)
            return null;
        const points = feature.geometry?.type === 'MultiPoint' ? coordinates : [coordinates];
        return points.map((point, index) => {
            const projected = project(point);
            return (_jsxs("g", { children: [matchedRule ? (_jsx("image", { href: matchedRule.iconUrl, x: projected.x - 12, y: projected.y - 24, width: 24, height: 24, preserveAspectRatio: "xMidYMid meet" })) : (_jsx("circle", { cx: projected.x, cy: projected.y, r: 6, fill: "#facc15", stroke: "#ffffff", strokeWidth: 1.5 })), _jsx("text", { x: projected.x, y: projected.y + 18, fill: "#ffffff", fontSize: "10", textAnchor: "middle", fontFamily: "Arial", children: name })] }, `${key}-${index}`));
        });
    };
    const renderFeature = (feature, index, source) => {
        const type = feature.geometry?.type;
        const coordinates = feature.geometry?.coordinates;
        if (!type || !coordinates)
            return null;
        if (type === 'LineString') {
            return renderLine(coordinates, `${source}-line-${index}`, source === 'road' ? '#38bdf8' : '#22c55e', source === 'road' ? 3 : 2);
        }
        if (type === 'MultiLineString') {
            return coordinates.map((line, lineIndex) => renderLine(line, `${source}-multi-line-${index}-${lineIndex}`, source === 'road' ? '#38bdf8' : '#22c55e', source === 'road' ? 3 : 2));
        }
        if (type === 'Polygon') {
            if (source === 'building') {
                return renderPolygon(coordinates, `${source}-polygon-${index}`, '#f87171', '#ef4444', 1, 0.35);
            }
            if (source === 'road') {
                return renderPolygon(coordinates, `${source}-polygon-${index}`, '#38bdf8', '#0ea5e9', 1, 0.45);
            }
            return renderPolygon(coordinates, `${source}-polygon-${index}`, '#ffffff', '#facc15', 1.5, 0.22);
        }
        if (type === 'MultiPolygon') {
            return coordinates.map((polygon, polygonIndex) => {
                if (source === 'building') {
                    return renderPolygon(polygon, `${source}-multi-polygon-${index}-${polygonIndex}`, '#f87171', '#ef4444', 1, 0.35);
                }
                if (source === 'road') {
                    return renderPolygon(polygon, `${source}-multi-polygon-${index}-${polygonIndex}`, '#38bdf8', '#0ea5e9', 1, 0.45);
                }
                return renderPolygon(polygon, `${source}-multi-polygon-${index}-${polygonIndex}`, '#ffffff', '#facc15', 1.5, 0.22);
            });
        }
        if (type === 'Point' || type === 'MultiPoint') {
            return renderMarker(feature, `${source}-marker-${index}`);
        }
        return null;
    };
    return (_jsxs("div", { className: "min-w-[1400px]", children: [_jsxs("div", { className: "mb-3 flex flex-wrap gap-3 text-xs text-white", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-2 bg-yellow-400 inline-block" }), "Polygon KML"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-2 bg-green-500 inline-block" }), "Polyline KML"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-2 bg-red-500 inline-block" }), "Bangunan"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-2 bg-sky-400 inline-block" }), "Jalan"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-3 h-3 bg-yellow-400 rounded-full inline-block" }), "Marker + Label"] })] }), markerIconRules.length > 0 && (_jsx("div", { className: "mb-3 flex flex-wrap gap-2 text-xs text-white", children: markerIconRules.map((rule) => (_jsxs("div", { className: "flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1", children: [_jsx("img", { src: rule.iconUrl, alt: rule.namePrefix, className: "w-5 h-5 object-contain" }), _jsxs("span", { children: [rule.namePrefix, "*"] })] }, rule.namePrefix))) })), _jsxs("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, className: "bg-[#0b1120] border border-white/20 rounded-xl", children: [_jsx("rect", { x: "0", y: "0", width: width, height: height, fill: "#0b1120" }), _jsxs("g", { opacity: "0.18", children: [Array.from({ length: 28 }).map((_, index) => {
                                const x = (width / 28) * index;
                                return (_jsx("line", { x1: x, y1: 0, x2: x, y2: height, stroke: "#ffffff", strokeWidth: "0.5" }, `v-${index}`));
                            }), Array.from({ length: 18 }).map((_, index) => {
                                const y = (height / 18) * index;
                                return (_jsx("line", { x1: 0, y1: y, x2: width, y2: y, stroke: "#ffffff", strokeWidth: "0.5" }, `h-${index}`));
                            })] }), (roadData?.features || []).map((feature, index) => renderFeature(feature, index, 'road')), (buildingData?.features || []).map((feature, index) => renderFeature(feature, index, 'building')), (geoData?.features || []).map((feature, index) => renderFeature(feature, index, 'kml'))] })] }));
};
export default DxfVisualPreview;
