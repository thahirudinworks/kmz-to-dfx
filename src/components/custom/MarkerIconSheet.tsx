import { Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { MarkerIconRule } from '@/types/map'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  markerIconRules: MarkerIconRule[]
  markerNamePrefix: string
  markerIconUrl: string
  setMarkerNamePrefix: (value: string) => void
  setMarkerIconUrl: (value: string) => void
  handleUploadMarkerIcon: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleAddMarkerIconRule: () => void
  handleRemoveMarkerIconRule: (namePrefix: string) => void
}

const MarkerIconSheet = ({
  open,
  onOpenChange,
  markerIconRules,
  markerNamePrefix,
  markerIconUrl,
  setMarkerNamePrefix,
  setMarkerIconUrl,
  handleUploadMarkerIcon,
  handleAddMarkerIconRule,
  handleRemoveMarkerIconRule,
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Ubah Icon Marker</SheetTitle>
          <SheetDescription>
            Upload gambar icon. Saat export DXF, gambar otomatis diubah menjadi
            DXF BLOCK vector, bukan circle.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label>Awalan Label</Label>
            <Input
              value={markerNamePrefix}
              onChange={(e) => setMarkerNamePrefix(e.target.value)}
              placeholder="Contoh: MMG"
            />
          </div>

          <div className="space-y-2">
            <Label>URL Icon</Label>
            <Input
              value={markerIconUrl}
              onChange={(e) => setMarkerIconUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Icon</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleUploadMarkerIcon}
            />
          </div>

          {markerIconUrl && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <img
                src={markerIconUrl}
                alt="Preview icon"
                className="h-10 w-10 object-contain"
              />
              <div className="text-sm text-muted-foreground">
                Preview icon marker
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAddMarkerIconRule}
            disabled={!markerNamePrefix.trim() || !markerIconUrl.trim()}
          >
            Terapkan Icon
          </Button>

          <div className="space-y-3">
            <div className="text-sm font-medium">Daftar Aturan</div>

            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-2">
                {markerIconRules.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Belum ada aturan icon.
                  </div>
                )}

                {markerIconRules.map((rule) => (
                  <div
                    key={rule.namePrefix}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={rule.iconUrl}
                        alt={rule.namePrefix}
                        className="h-9 w-9 shrink-0 object-contain"
                      />

                      <div className="min-w-0">
                        <Badge variant="secondary">
                          {rule.namePrefix}*
                        </Badge>

                        <div className="mt-1 truncate text-xs text-muted-foreground">
                          Block: {rule.dxfBlockName}
                        </div>

                        <div className="truncate text-xs text-muted-foreground">
                          Vector cells: {rule.dxfCells.length}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveMarkerIconRule(rule.namePrefix)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MarkerIconSheet