import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadWidthMeter: string
  setRoadWidthMeter: (value: string) => void
  detectedRoadWidthMeter: number | null
  roadCount: number
}

const RoadWidthSheet = ({
  open,
  onOpenChange,
  roadWidthMeter,
  setRoadWidthMeter,
  detectedRoadWidthMeter,
  roadCount,
}: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Atur Lebar Jalan</SheetTitle>
          <SheetDescription>
            Lebar jalan memakai satuan meter. Jika OSM punya data width/lanes,
            nilainya otomatis masuk ke input dan tetap bisa kamu ubah.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-sm font-medium">Status Data Jalan</div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{roadCount} jalan tampil</Badge>

              {detectedRoadWidthMeter ? (
                <Badge>OSM: {detectedRoadWidthMeter} m</Badge>
              ) : (
                <Badge variant="outline">OSM width tidak tersedia</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lebar Jalan Custom</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={roadWidthMeter}
                onChange={(e) => setRoadWidthMeter(e.target.value)}
                placeholder="Contoh: 7"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Kosongkan input jika ingin kembali mengikuti data OSM. Jika OSM
              juga kosong, jalan tidak akan dipaksa memiliki lebar fallback.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RoadWidthSheet