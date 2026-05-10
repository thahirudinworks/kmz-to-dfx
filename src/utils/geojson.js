import { booleanIntersects, booleanPointInPolygon, centroid, } from '@turf/turf';
export const getFeatureName = (feature) => {
    return (feature?.properties?.name ||
        feature?.properties?.Name ||
        feature?.properties?.title ||
        feature?.properties?.description ||
        '');
};
export const getPolygonAreas = (converted) => {
    return {
        type: 'FeatureCollection',
        features: (converted.features || []).filter((feature) => {
            const type = feature.geometry?.type;
            return type === 'Polygon' || type === 'MultiPolygon';
        }),
    };
};
export const filterBuildingsInsidePolygons = (buildingGeojson, polygonGeojson) => {
    const polygons = polygonGeojson.features || [];
    return {
        ...buildingGeojson,
        features: (buildingGeojson.features || []).filter((building) => {
            const type = building.geometry?.type;
            if (type !== 'Polygon' && type !== 'MultiPolygon')
                return false;
            const buildingCenter = centroid(building);
            return polygons.some((polygon) => {
                try {
                    return booleanPointInPolygon(buildingCenter, polygon);
                }
                catch {
                    return false;
                }
            });
        }),
    };
};
export const filterRoadPolygonsInsidePolygons = (roadGeojson, polygonGeojson) => {
    const polygons = polygonGeojson.features || [];
    return {
        ...roadGeojson,
        features: (roadGeojson.features || []).filter((road) => {
            return polygons.some((polygon) => {
                try {
                    return booleanIntersects(road, polygon);
                }
                catch {
                    return false;
                }
            });
        }),
    };
};
