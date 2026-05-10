import {
  booleanIntersects,
  booleanPointInPolygon,
  centroid,
} from '@turf/turf'

export const getFeatureName = (feature: any) => {
  return (
    feature?.properties?.name ||
    feature?.properties?.Name ||
    feature?.properties?.title ||
    feature?.properties?.description ||
    ''
  )
}

export const getPolygonAreas = (converted: any) => {
  return {
    type: 'FeatureCollection',
    features: (converted.features || []).filter((feature: any) => {
      const type = feature.geometry?.type
      return type === 'Polygon' || type === 'MultiPolygon'
    }),
  }
}

export const filterBuildingsInsidePolygons = (
  buildingGeojson: any,
  polygonGeojson: any
) => {
  const polygons = polygonGeojson.features || []

  return {
    ...buildingGeojson,
    features: (buildingGeojson.features || []).filter((building: any) => {
      const type = building.geometry?.type

      if (type !== 'Polygon' && type !== 'MultiPolygon') return false

      const buildingCenter = centroid(building)

      return polygons.some((polygon: any) => {
        try {
          return booleanPointInPolygon(buildingCenter, polygon)
        } catch {
          return false
        }
      })
    }),
  }
}

export const filterRoadPolygonsInsidePolygons = (
  roadGeojson: any,
  polygonGeojson: any
) => {
  const polygons = polygonGeojson.features || []

  return {
    ...roadGeojson,
    features: (roadGeojson.features || []).filter((road: any) => {
      return polygons.some((polygon: any) => {
        try {
          return booleanIntersects(road, polygon)
        } catch {
          return false
        }
      })
    }),
  }
}