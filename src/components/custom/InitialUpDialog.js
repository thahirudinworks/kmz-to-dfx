import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const InitialUploadDialog = ({ open, onUpload }) => {
    return (_jsx(Dialog, { open: open, children: _jsxs(DialogContent, { className: "sm:max-w-md", onInteractOutside: (event) => event.preventDefault(), onEscapeKeyDown: (event) => event.preventDefault(), children: [_jsxs(DialogHeader, { children: [_jsx("div", { className: "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10", children: _jsx(UploadCloud, { className: "h-7 w-7 text-primary" }) }), _jsx(DialogTitle, { className: "text-center", children: "Upload File KML / KMZ" }), _jsx(DialogDescription, { className: "text-center", children: "Silakan upload file terlebih dahulu untuk menampilkan polygon, polyline, marker, bangunan, dan jalan pada peta." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "kml-kmz-file", children: "File KML / KMZ" }), _jsx(Input, { id: "kml-kmz-file", type: "file", accept: ".kml,.kmz", onChange: onUpload })] })] }) }));
};
export default InitialUploadDialog;
