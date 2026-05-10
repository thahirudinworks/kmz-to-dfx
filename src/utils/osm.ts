import osmtogeojson from 'osmtogeojson'
import { buffer } from '@turf/turf'
import {
  filterBuildingsInsidePolygons,
  filterRoadPolygonsInsidePolygons,
} from './geojson'

export const parseOsmWidth = (widthValue: any) => {
  if (!widthValue) return null

  const value = String(widthValue)
    .toLowerCase()
    .replace(',', '.')
    .replace('m', '')
    .trim()

  const parsed = parseFloat(value)

  if (Number.isNaN(parsed)) return null

  return parsed
}

export const getRoadWidthMeterFromOsm = (properties: any) => {
  const width = parseOsmWidth(properties?.width)

  if (width && width > 0) {
    return {
      widthMeter: width,
      source: 'osm_width',
    }
  }

  const lanes = parseInt(properties?.lanes)

  if (!Number.isNaN(lanes) && lanes > 0) {
    return {
      widthMeter: lanes * 3.5,
      source: 'osm_lanes',
    }
  }

  let fallbackWidth = 6

  switch (properties?.highway) {
    case 'motorway':
    case 'trunk':
      fallbackWidth = 18
      break
    case 'primary':
      fallbackWidth = 10
      break
    case 'secondary':
      fallbackWidth = 8
      break
    case 'tertiary':
      fallbackWidth = 6
      break
    case 'residential':
    case 'living_street':
      fallbackWidth = 6
      break
    case 'service':
    case 'track':
      fallbackWidth = 5
      break
    case 'footway':
    case 'path':
    case 'pedestrian':
    case 'cycleway':
      fallbackWidth = 3
      break
    default:
      fallbackWidth = 6
  }

  return {
    widthMeter: fallbackWidth,
    source: 'fallback_highway',
  }
}

export const buildRoadPolygonGeojson = (
  rawRoadGeojson: any,
  customWidthMeter?: number | null
) => {
  let firstDetectedWidth: number | null = null

  // Temukan firstDetectedWidth terlebih dahulu
  for (const road of rawRoadGeojson.features || []) {
    const type = road.geometry?.type
    if (type === 'LineString' || type === 'MultiLineString') {
      const osmWidth = getRoadWidthMeterFromOsm(road.properties)
      if (osmWidth.widthMeter) {
        firstDetectedWidth = osmWidth.widthMeter
        break
      }
    }
  }

  // Hitung rasio skala
  let scaleRatio = 1
  if (customWidthMeter && firstDetectedWidth && firstDetectedWidth > 0) {
    scaleRatio = customWidthMeter / firstDetectedWidth
  }

  const roadPolygonGeojson = {
    type: 'FeatureCollection',
    features: (rawRoadGeojson.features || [])
      .filter((road: any) => {
        const type = road.geometry?.type
        return type === 'LineString' || type === 'MultiLineString'
      })
      .map((road: any) => {
        const osmWidth = getRoadWidthMeterFromOsm(road.properties)
        const baseWidth = osmWidth.widthMeter

        if (!baseWidth || baseWidth <= 0) return null

        const finalWidth = baseWidth * scaleRatio

        try {
          const roadPolygon = buffer(road, finalWidth / 2, {
            units: 'meters',
          })

          if (!roadPolygon) return null

          return {
            ...roadPolygon,
            properties: {
              ...road.properties,
              calculated_width_meter: finalWidth,
              width_source: customWidthMeter
                ? 'custom_scaled'
                : osmWidth.source,
            },
          }
        } catch {
          return null
        }
      })
      .filter(Boolean),
  }

  return {
    roadPolygonGeojson,
    firstDetectedWidth,
  }
}

const fetchOverpass = async (query: string): Promise<any> => {
  const response = await fetch('/api/overpass', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  })

  if (!response.ok) throw new Error(`Overpass proxy error: HTTP ${response.status}`)

  return response.json()
}

export const fetchBuildingsInsideArea = async (
  bounds: L.LatLngBounds,
  polygonGeojson: any
) => {
  const south = bounds.getSouth()
  const west = bounds.getWest()
  const north = bounds.getNorth()
  const east = bounds.getEast()

  const query = `
    [out:json][timeout:25];
    (
      way["building"](${south},${west},${north},${east});
      relation["building"](${south},${west},${north},${east});
    );
    out body;
    >;
    out skel qt;
  `

  const osmJson = await fetchOverpass(query)
  const buildingGeojson = osmtogeojson(osmJson)

  return filterBuildingsInsidePolygons(buildingGeojson, polygonGeojson)
}

export const fetchRawRoadsInsideArea = async (bounds: L.LatLngBounds) => {
  const south = bounds.getSouth()
  const west = bounds.getWest()
  const north = bounds.getNorth()
  const east = bounds.getEast()

  const query = `
    [out:json][timeout:25];
    (
      way["highway"](${south},${west},${north},${east});
      relation["highway"](${south},${west},${north},${east});
    );
    out body;
    >;
    out skel qt;
  `

  const osmJson = await fetchOverpass(query)

  return osmtogeojson(osmJson)
}

export const createFilteredRoads = (
  rawRoadGeojson: any,
  polygonGeojson: any,
  customWidthMeter?: number | null
) => {
  const { roadPolygonGeojson, firstDetectedWidth } = buildRoadPolygonGeojson(
    rawRoadGeojson,
    customWidthMeter
  )

  return {
    filteredRoads: filterRoadPolygonsInsidePolygons(
      roadPolygonGeojson,
      polygonGeojson
    ),
    firstDetectedWidth,
  }
}