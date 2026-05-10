import { GeoJSON, MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { DEFAULT_CENTER, TILE_URLS } from '@/constants/map'
import { createMarkerIcon, getIconRuleByName } from '@/utils/marker'
import { getFeatureName } from '@/utils/geojson'
import type { MapType, MarkerIconRule } from '@/types/map'

type Props = {
  mapType: MapType
  visibleGeoData: any
  buildingData: any
  roadData: any
  markerIconRules: MarkerIconRule[]
  geoJsonRef: React.MutableRefObject<L.GeoJSON | null>
  mapRef: React.MutableRefObject<L.Map | null>
  canvasRenderer: L.Canvas
  isLargeData: boolean
  roadWidthMeter: string
}

const LeafletMapView = ({
  mapType,
  visibleGeoData,
  buildingData,
  roadData,
  markerIconRules,
  geoJsonRef,
  mapRef,
  canvasRenderer,
  isLargeData,
  roadWidthMeter,
}: Props) => {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={13}
      minZoom={3}
      maxZoom={22}
      scrollWheelZoom
      preferCanvas
      zoomControl={false}
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      {mapType === 'satellite' ? (
        <TileLayer
          key="satellite"
          url={TILE_URLS.satellite}
          maxZoom={22}
          maxNativeZoom={22}
        />
      ) : (
        <TileLayer
          key="vector"
          url={TILE_URLS.vector}
          maxZoom={22}
          maxNativeZoom={19}
        />
      )}
      <ZoomControl position="bottomright" />
      {roadData && (
        <GeoJSON
          key={`road-${roadData.features?.length || 0}-${roadWidthMeter}`}
          data={roadData}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ renderer: canvasRenderer } as any)}
          interactive={false}
          style={(feature) => {
            const source = feature?.properties?.width_source

            return {
              color:
                source === 'osm_width'
                  ? '#2563eb'
                  : source === 'osm_lanes'
                    ? '#3b82f6'
                    : '#60a5fa',
              weight: 1,
              fillColor:
                source === 'osm_width'
                  ? '#2563eb'
                  : source === 'osm_lanes'
                    ? '#3b82f6'
                    : '#60a5fa',
              fillOpacity: 0.45,
              opacity: 0.85,
            }
          }}
        />
      )}

      {buildingData && (
        <GeoJSON
          data={buildingData}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ renderer: canvasRenderer } as any)}
          interactive={false}
          style={() => ({
            color: '#ff0000',
            weight: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.35,
          })}
        />
      )}

      {visibleGeoData && (
        <GeoJSON
          key={`${visibleGeoData.features.length}-${markerIconRules.length}`}
          ref={geoJsonRef}
          data={visibleGeoData}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ renderer: canvasRenderer } as any)}
          interactive={!isLargeData}
          style={(feature) => {
            const geometryType = feature?.geometry?.type || ''

            if (
              geometryType === 'LineString' ||
              geometryType === 'MultiLineString'
            ) {
              return {
                color: '#00ff00',
                weight: isLargeData ? 2 : 4,
                opacity: 0.8,
              }
            }

            if (
              geometryType === 'Polygon' ||
              geometryType === 'MultiPolygon'
            ) {
              return {
                color: '#ffffff',
                weight: isLargeData ? 1 : 2,
                fillColor: '#ffff00',
                fillOpacity: isLargeData ? 0.12 : 0.25,
              }
            }

            return {}
          }}
          pointToLayer={(feature, latlng) => {
            const name = getFeatureName(feature)
            const matchedRule = getIconRuleByName(name, markerIconRules)

            if (matchedRule) {
              return L.marker(latlng, {
                icon: createMarkerIcon(matchedRule.iconUrl),
              })
            }

            return L.circleMarker(latlng, {
              renderer: canvasRenderer,
              radius: isLargeData ? 3 : 5,
              weight: 1,
              fillOpacity: 0.8,
            })
          }}
          onEachFeature={(feature, layer) => {
            if (isLargeData) return

            const name = getFeatureName(feature) || 'Tidak ada nama'

            layer.bindPopup(`
              <div>
                <strong>${name}</strong>
              </div>
            `)
          }}
        />
      )}
    </MapContainer>
  )
}

export default LeafletMapView