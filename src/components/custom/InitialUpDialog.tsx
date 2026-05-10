import { UploadCloud } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
    open: boolean
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const InitialUploadDialog = ({ open, onUpload }: Props) => {
    return (
        <Dialog open={open}>
            <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <UploadCloud className="h-7 w-7 text-primary" />
                    </div>

                    <DialogTitle className="text-center">
                        Upload File KML / KMZ
                    </DialogTitle>

                    <DialogDescription className="text-center">
                        Silakan upload file terlebih dahulu untuk menampilkan polygon,
                        polyline, marker, bangunan, dan jalan pada peta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="kml-kmz-file">File KML / KMZ</Label>
                    <Input
                        id="kml-kmz-file"
                        type="file"
                        accept=".kml,.kmz"
                        onChange={onUpload}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InitialUploadDialog