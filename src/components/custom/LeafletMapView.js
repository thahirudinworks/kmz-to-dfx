import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_CENTER, TILE_URLS } from '@/constants/map';
import { createMarkerIcon, getIconRuleByName } from '@/utils/marker';
import { getFeatureName } from '@/utils/geojson';
const LeafletMapView = ({ mapType, visibleGeoData, buildingData, roadData, markerIconRules, geoJsonRef, mapRef, canvasRenderer, isLargeData, roadWidthMeter, }) => {
    return (_jsxs(MapContainer, { center: DEFAULT_CENTER, zoom: 13, minZoom: 3, maxZoom: 22, scrollWheelZoom: true, preferCanvas: true, zoomControl: false, ref: mapRef, style: {
            height: '100%',
            width: '100%',
        }, children: [mapType === 'satellite' ? (_jsx(TileLayer, { url: TILE_URLS.satellite, maxZoom: 22, maxNativeZoom: 22 }, "satellite")) : (_jsx(TileLayer, { url: TILE_URLS.vector, maxZoom: 22, maxNativeZoom: 19 }, "vector")), _jsx(ZoomControl, { position: "bottomright" }), roadData && (_jsx(GeoJSON, { data: roadData, renderer: canvasRenderer, interactive: false, style: (feature) => {
                    const source = feature?.properties?.width_source;
                    return {
                        color: source === 'osm_width'
                            ? '#2563eb'
                            : source === 'osm_lanes'
                                ? '#3b82f6'
                                : '#60a5fa',
                        weight: 1,
                        fillColor: source === 'osm_width'
                            ? '#2563eb'
                            : source === 'osm_lanes'
                                ? '#3b82f6'
                                : '#60a5fa',
                        fillOpacity: 0.45,
                        opacity: 0.85,
                    };
                } }, `road-${roadData.features?.length || 0}-${roadWidthMeter}`)), buildingData && (_jsx(GeoJSON, { data: buildingData, renderer: canvasRenderer, interactive: false, style: () => ({
                    color: '#ff0000',
                    weight: 1,
                    fillColor: '#ff0000',
                    fillOpacity: 0.35,
                }) })), visibleGeoData && (_jsx(GeoJSON, { ref: geoJsonRef, data: visibleGeoData, renderer: canvasRenderer, interactive: !isLargeData, style: (feature) => {
                    const geometryType = feature?.geometry?.type || '';
                    if (geometryType === 'LineString' ||
                        geometryType === 'MultiLineString') {
                        return {
                            color: '#00ff00',
                            weight: isLargeData ? 2 : 4,
                            opacity: 0.8,
                        };
                    }
                    if (geometryType === 'Polygon' ||
                        geometryType === 'MultiPolygon') {
                        return {
                            color: '#ffffff',
                            weight: isLargeData ? 1 : 2,
                            fillColor: '#ffff00',
                            fillOpacity: isLargeData ? 0.12 : 0.25,
                        };
                    }
                    return {};
                }, pointToLayer: (feature, latlng) => {
                    const name = getFeatureName(feature);
                    const matchedRule = getIconRuleByName(name, markerIconRules);
                    if (matchedRule) {
                        return L.marker(latlng, {
                            icon: createMarkerIcon(matchedRule.iconUrl),
                        });
                    }
                    return L.circleMarker(latlng, {
                        renderer: canvasRenderer,
                        radius: isLargeData ? 3 : 5,
                        weight: 1,
                        fillOpacity: 0.8,
                    });
                }, onEachFeature: (feature, layer) => {
                    if (isLargeData)
                        return;
                    const name = getFeatureName(feature) || 'Tidak ada nama';
                    layer.bindPopup(`
              <div>
                <strong>${name}</strong>
              </div>
            `);
                } }, `${visibleGeoData.features.length}-${markerIconRules.length}`))] }));
};
export default LeafletMapView;
