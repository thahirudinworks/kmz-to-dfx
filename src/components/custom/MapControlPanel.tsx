import type { MapType, MarkerIconRule } from '@/types/map'

type Props = {
  mapType: MapType
  setMapType: (type: MapType) => void

  markerIconRules: MarkerIconRule[]
  markerNamePrefix: string
  markerIconUrl: string
  setMarkerNamePrefix: (value: string) => void
  setMarkerIconUrl: (value: string) => void

  handleUploadKmlKmz: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleUploadMarkerIcon: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleAddMarkerIconRule: () => void
  handleRemoveMarkerIconRule: (namePrefix: string) => void

  setIsDxfPreviewOpen: (value: boolean) => void

  featureCount: number
  buildingCount: number
  roadCount: number
  canExportDxf: boolean

  isLoading: boolean
  isLoadingBuildings: boolean
  isLoadingRoads: boolean
}

const MapControlPanel = ({
  mapType,
  setMapType,
  markerIconRules,
  markerNamePrefix,
  markerIconUrl,
  setMarkerNamePrefix,
  setMarkerIconUrl,
  handleUploadKmlKmz,
  handleUploadMarkerIcon,
  handleAddMarkerIconRule,
  handleRemoveMarkerIconRule,
  setIsDxfPreviewOpen,
  featureCount,
  buildingCount,
  roadCount,
  canExportDxf,
  isLoading,
  isLoadingBuildings,
  isLoadingRoads,
}: Props) => {
  return (
    <div className="absolute z-[1000] top-4 right-4 bg-white p-4 rounded-xl shadow-lg space-y-3 w-[320px] max-h-[90vh] overflow-y-auto">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700">
          Upload KML / KMZ
        </label>
        <input
          type="file"
          accept=".kml,.kmz"
          onChange={handleUploadKmlKmz}
          className="text-xs"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            mapType === 'satellite'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Satellite
        </button>

        <button
          type="button"
          onClick={() => setMapType('vector')}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            mapType === 'vector'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Vector
        </button>
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="text-sm font-semibold text-gray-800">
          Ubah Icon Marker
        </div>

        <input
          type="text"
          value={markerNamePrefix}
          onChange={(e) => setMarkerNamePrefix(e.target.value)}
          placeholder="Awalan label, contoh: MMG"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="text"
          value={markerIconUrl}
          onChange={(e) => setMarkerIconUrl(e.target.value)}
          placeholder="URL icon marker"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleUploadMarkerIcon}
          className="text-xs"
        />

        {markerIconUrl && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Preview:</span>
            <img
              src={markerIconUrl}
              alt="Preview icon"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleAddMarkerIconRule}
          className="w-full bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium"
        >
          Terapkan Icon
        </button>

        {markerIconRules.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-gray-700">
              Daftar aturan icon:
            </div>

            {markerIconRules.map((rule) => (
              <div
                key={rule.namePrefix}
                className="flex items-center justify-between gap-2 bg-gray-50 border rounded-lg px-2 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={rule.iconUrl}
                    alt={rule.namePrefix}
                    className="w-7 h-7 object-contain shrink-0"
                  />
                  <div className="text-xs truncate">
                    Label: {rule.namePrefix}*
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMarkerIconRule(rule.namePrefix)}
                  className="text-xs text-red-600"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="text-sm font-semibold text-gray-800">
          Export DXF AutoCAD
        </div>

        <button
          type="button"
          disabled={!canExportDxf}
          onClick={() => setIsDxfPreviewOpen(true)}
          className={`w-full rounded-lg px-3 py-2 text-sm font-medium ${
            canExportDxf
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Preview Tampilan DXF
        </button>

        <div className="text-[11px] text-gray-500 leading-relaxed">
          Preview akan menampilkan simulasi tampilan seperti AutoCAD.
        </div>
      </div>

      {featureCount > 0 && (
        <div className="text-xs text-gray-600 space-y-1 border-t pt-3">
          <div>Total data KML/KMZ: {featureCount}</div>
          <div>Bangunan dalam polygon: {buildingCount}</div>
          <div>Jalan dalam polygon: {roadCount}</div>
        </div>
      )}

      {isLoading && (
        <div className="text-xs text-blue-600">Memuat data peta...</div>
      )}

      {isLoadingBuildings && (
        <div className="text-xs text-green-600">
          Mengambil data bangunan...
        </div>
      )}

      {isLoadingRoads && (
        <div className="text-xs text-orange-600">
          Mengambil data jalan...
        </div>
      )}
    </div>
  )
}

export default MapControlPanel