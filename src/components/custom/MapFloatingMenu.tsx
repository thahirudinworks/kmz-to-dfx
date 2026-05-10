import {
  Download,
  ImageIcon,
  Layers,
  Map,
  Ruler,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { MapType } from '@/types/map'

type Props = {
  mapType: MapType
  setMapType: (type: MapType) => void
  canExportDxf: boolean
  onOpenMarkerSheet: () => void
  onOpenRoadWidthSheet: () => void
  onExportDxf: () => void
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const MapFloatingMenu = ({
  mapType,
  setMapType,
  canExportDxf,
  onOpenMarkerSheet,
  onOpenRoadWidthSheet,
  onExportDxf,
  onUpload,
}: Props) => {
  return (
    <TooltipProvider>
      <Card className="absolute left-4 top-4 z-[1000] flex items-center gap-2 p-2 shadow-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              onClick={() => setMapType('satellite')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Satellite</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={mapType === 'vector' ? 'default' : 'outline'}
              onClick={() => setMapType('vector')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vector</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onOpenMarkerSheet}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ubah Icon Marker</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" onClick={onOpenRoadWidthSheet}>
              <Ruler className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Atur Lebar Jalan</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" disabled={!canExportDxf} onClick={onExportDxf}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export DXF</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <label>
              <input
                type="file"
                accept=".kml,.kmz"
                className="hidden"
                onChange={onUpload}
              />
              <Button size="icon" variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </TooltipTrigger>
          <TooltipContent>Upload ulang file</TooltipContent>
        </Tooltip>
      </Card>
    </TooltipProvider>
  )
}

export default MapFloatingMenu