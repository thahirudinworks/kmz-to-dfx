import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMapExporter } from '@/hooks/useMapExport';
import LeafletMapView from '@/components/custom/LeafletMapView';
import InitialUploadDialog from '@/components/custom/InitialUpDialog';
import MapFloatingMenu from '@/components/custom/MapFloatingMenu';
import MarkerIconSheet from '@/components/custom/MarkerIconSheet';
import RoadWidthSheet from '@/components/custom/RoadWithSheet';
const HomePage = () => {
    const mapExporter = useMapExporter();
    const [isMarkerSheetOpen, setIsMarkerSheetOpen] = useState(false);
    const [isRoadWidthSheetOpen, setIsRoadWidthSheetOpen] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            mapExporter.fitMapAndLoadOsmData();
        }, 500);
        return () => clearTimeout(timer);
    }, [mapExporter.visibleGeoData]);
    const hasFile = mapExporter.featureCount > 0;
    return (_jsxs("div", { className: "relative h-screen w-full overflow-hidden", children: [_jsx(InitialUploadDialog, { open: !hasFile, onUpload: mapExporter.handleUploadKmlKmz }), _jsx(MapFloatingMenu, { mapType: mapExporter.mapType, setMapType: mapExporter.setMapType, canExportDxf: mapExporter.canExportDxf, onOpenMarkerSheet: () => setIsMarkerSheetOpen(true), onOpenRoadWidthSheet: () => setIsRoadWidthSheetOpen(true), onExportDxf: mapExporter.downloadDxf, onUpload: mapExporter.handleUploadKmlKmz }), _jsx(MarkerIconSheet, { open: isMarkerSheetOpen, onOpenChange: setIsMarkerSheetOpen, markerIconRules: mapExporter.markerIconRules, markerNamePrefix: mapExporter.markerNamePrefix, markerIconUrl: mapExporter.markerIconUrl, setMarkerNamePrefix: mapExporter.setMarkerNamePrefix, setMarkerIconUrl: mapExporter.setMarkerIconUrl, handleUploadMarkerIcon: mapExporter.handleUploadMarkerIcon, handleAddMarkerIconRule: mapExporter.handleAddMarkerIconRule, handleRemoveMarkerIconRule: mapExporter.handleRemoveMarkerIconRule }), _jsx(RoadWidthSheet, { open: isRoadWidthSheetOpen, onOpenChange: setIsRoadWidthSheetOpen, roadWidthMeter: mapExporter.roadWidthMeter, setRoadWidthMeter: mapExporter.setRoadWidthMeter, detectedRoadWidthMeter: mapExporter.detectedRoadWidthMeter, roadCount: mapExporter.roadCount }), _jsx(LeafletMapView, { ...mapExporter })] }));
};
export default HomePage;
