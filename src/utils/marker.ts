import L from 'leaflet'
import type { MarkerIconRule } from '@/types/map'

export const createMarkerIcon = (iconUrl: string) => {
  return L.icon({
    iconUrl,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  })
}

export const getIconRuleByName = (
  name: string,
  markerIconRules: MarkerIconRule[]
) => {
  const normalizedName = name.toLowerCase().trim()

  return markerIconRules.find((rule) => {
    const prefix = rule.namePrefix.toLowerCase().trim()
    return normalizedName.startsWith(prefix)
  })
}