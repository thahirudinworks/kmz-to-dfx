import type { MarkerIconRule } from '@/types/map'
import DxfVisualPreview from './DfxVisualPreview'

type Props = {
  geoData: any
  buildingData: any
  roadData: any
  markerIconRules: MarkerIconRule[]
  onClose: () => void
  onDownload: () => void
}

const DxfPreviewModal = ({
  geoData,
  buildingData,
  roadData,
  markerIconRules,
  onClose,
  onDownload,
}: Props) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">
              Preview Tampilan DXF AutoCAD
            </div>
            <div className="text-xs text-gray-500">
              Simulasi visual polygon, polyline, marker, label, bangunan,
              dan jalan.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
          >
            Tutup
          </button>
        </div>

        <div className="flex-1 bg-[#111827] overflow-auto p-4">
          <DxfVisualPreview
            geoData={geoData}
            buildingData={buildingData}
            roadData={roadData}
            markerIconRules={markerIconRules}
          />
        </div>

        <div className="p-4 border-t flex justify-between gap-2">
          <div className="text-xs text-gray-500 max-w-xl">
            Catatan: pada preview web icon asli bisa tampil. Di file DXF,
            marker akan menjadi simbol lingkaran + label + teks keterangan
            icon karena DXF browser-side tidak aman embed image dari URL/blob.
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium"
            >
              Download DXF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DxfPreviewModal