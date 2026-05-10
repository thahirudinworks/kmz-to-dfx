import { useEffect, useState } from 'react'
import { useMapExporter } from '@/hooks/useMapExport'
import LeafletMapView from '@/components/custom/LeafletMapView'
import InitialUploadDialog from '@/components/custom/InitialUpDialog'
import MapFloatingMenu from '@/components/custom/MapFloatingMenu'
import MarkerIconSheet from '@/components/custom/MarkerIconSheet'
import RoadWidthSheet from '@/components/custom/RoadWithSheet'

const HomePage = () => {
  const mapExporter = useMapExporter()

  const [isMarkerSheetOpen, setIsMarkerSheetOpen] = useState(false)
  const [isRoadWidthSheetOpen, setIsRoadWidthSheetOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      mapExporter.fitMapAndLoadOsmData()
    }, 500)

    return () => clearTimeout(timer)
  }, [mapExporter.visibleGeoData])

  const hasFile = mapExporter.featureCount > 0

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <InitialUploadDialog
        open={!hasFile}
        onUpload={mapExporter.handleUploadKmlKmz}
      />

      <MapFloatingMenu
        mapType={mapExporter.mapType}
        setMapType={mapExporter.setMapType}
        canExportDxf={mapExporter.canExportDxf}
        onOpenMarkerSheet={() => setIsMarkerSheetOpen(true)}
        onOpenRoadWidthSheet={() => setIsRoadWidthSheetOpen(true)}
        onExportDxf={mapExporter.downloadDxf}
        onUpload={mapExporter.handleUploadKmlKmz}
      />

      <MarkerIconSheet
        open={isMarkerSheetOpen}
        onOpenChange={setIsMarkerSheetOpen}
        markerIconRules={mapExporter.markerIconRules}
        markerNamePrefix={mapExporter.markerNamePrefix}
        markerIconUrl={mapExporter.markerIconUrl}
        setMarkerNamePrefix={mapExporter.setMarkerNamePrefix}
        setMarkerIconUrl={mapExporter.setMarkerIconUrl}
        handleUploadMarkerIcon={mapExporter.handleUploadMarkerIcon}
        handleAddMarkerIconRule={mapExporter.handleAddMarkerIconRule}
        handleRemoveMarkerIconRule={mapExporter.handleRemoveMarkerIconRule}
      />

      <RoadWidthSheet
        open={isRoadWidthSheetOpen}
        onOpenChange={setIsRoadWidthSheetOpen}
        roadWidthMeter={mapExporter.roadWidthMeter}
        setRoadWidthMeter={mapExporter.setRoadWidthMeter}
        detectedRoadWidthMeter={mapExporter.detectedRoadWidthMeter}
        roadCount={mapExporter.roadCount}
      />

      <LeafletMapView {...mapExporter} />
    </div>
  )
}

export default HomePage