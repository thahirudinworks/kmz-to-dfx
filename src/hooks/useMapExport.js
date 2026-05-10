import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { CHUNK_SIZE } from "@/constants/map";
import { convertKmlTextToGeoJson, readKmlFromKmz } from "@/utils/kml";
import { getPolygonAreas } from "@/utils/geojson";
import { downloadDxfFile, generateDxfContent } from "@/utils/dxf";
import { createFilteredRoads, fetchBuildingsInsideArea, fetchRawRoadsInsideArea, } from "@/utils/osm";
import { createDxfBlockNameFromPrefix, imageFileToDxfCells, } from "@/utils/imageToDxfBlock";
export const useMapExporter = () => {
    const [geoData, setGeoData] = useState(null);
    const [visibleGeoData, setVisibleGeoData] = useState(null);
    const [buildingData, setBuildingData] = useState(null);
    const [roadData, setRoadData] = useState(null);
    const [rawRoadData, setRawRoadData] = useState(null);
    const [polygonAreas, setPolygonAreas] = useState(null);
    const [inputFileName, setInputFileName] = useState("map-export");
    const [mapType, setMapType] = useState("satellite");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
    const [isLoadingRoads, setIsLoadingRoads] = useState(false);
    const [markerIconRules, setMarkerIconRules] = useState([]);
    const [markerNamePrefix, setMarkerNamePrefix] = useState("");
    const [markerIconUrl, setMarkerIconUrl] = useState("");
    const [markerDxfCells, setMarkerDxfCells] = useState([]);
    const [roadWidthMeter, setRoadWidthMeter] = useState("");
    const [detectedRoadWidthMeter, setDetectedRoadWidthMeter] = useState(null);
    const [debouncedRoadWidth, setDebouncedRoadWidth] = useState("");
    const geoJsonRef = useRef(null);
    const mapRef = useRef(null);
    const hasFitBoundsRef = useRef(false);
    const canvasRenderer = useMemo(() => {
        return L.canvas({
            padding: 0.5,
            tolerance: 5,
        });
    }, []);
    const getCustomRoadWidth = () => {
        const parsed = parseFloat(roadWidthMeter);
        if (Number.isNaN(parsed) || parsed <= 0)
            return null;
        return parsed;
    };
    const renderGeoJsonInChunks = (converted) => {
        setIsLoading(true);
        const features = converted.features || [];
        let index = 0;
        setVisibleGeoData({
            ...converted,
            features: [],
        });
        const renderChunk = () => {
            index += CHUNK_SIZE;
            setVisibleGeoData({
                ...converted,
                features: features.slice(0, index),
            });
            if (index < features.length) {
                requestAnimationFrame(renderChunk);
            }
            else {
                setIsLoading(false);
            }
        };
        requestAnimationFrame(renderChunk);
    };
    const handleUploadKmlKmz = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setInputFileName(nameWithoutExt);
        setIsLoading(true);
        hasFitBoundsRef.current = false;
        setGeoData(null);
        setVisibleGeoData(null);
        setBuildingData(null);
        setRoadData(null);
        setRawRoadData(null);
        setPolygonAreas(null);
        setDetectedRoadWidthMeter(null);
        setRoadWidthMeter("");
        try {
            const extension = file.name.split(".").pop()?.toLowerCase();
            let text = "";
            if (extension === "kmz") {
                text = await readKmlFromKmz(file);
            }
            else {
                text = await file.text();
            }
            const converted = convertKmlTextToGeoJson(text);
            setGeoData(converted);
            renderGeoJsonInChunks(converted);
        }
        catch (error) {
            console.error("Gagal membaca KML/KMZ:", error);
            setIsLoading(false);
        }
        finally {
            event.target.value = "";
        }
    };
    const handleUploadMarkerIcon = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const objectUrl = URL.createObjectURL(file);
        try {
            const cells = await imageFileToDxfCells(file, {
                size: 24,
                sampleStep: 2,
                alphaThreshold: 30,
                maxCells: 180,
            });
            setMarkerIconUrl(objectUrl);
            setMarkerDxfCells(cells);
        }
        catch (error) {
            console.error("Gagal mengubah icon menjadi DXF block:", error);
            URL.revokeObjectURL(objectUrl);
        }
        finally {
            event.target.value = "";
        }
    };
    const handleAddMarkerIconRule = () => {
        const prefix = markerNamePrefix.trim();
        const icon = markerIconUrl.trim();
        if (!prefix || !icon)
            return;
        const blockName = createDxfBlockNameFromPrefix(prefix);
        setMarkerIconRules((prev) => {
            const filtered = prev.filter((item) => item.namePrefix.toLowerCase() !== prefix.toLowerCase());
            return [
                ...filtered,
                {
                    namePrefix: prefix,
                    iconUrl: icon,
                    dxfBlockName: blockName,
                    dxfCells: markerDxfCells,
                },
            ];
        });
        setMarkerNamePrefix("");
        setMarkerIconUrl("");
        setMarkerDxfCells([]);
    };
    const handleRemoveMarkerIconRule = (namePrefix) => {
        setMarkerIconRules((prev) => prev.filter((item) => item.namePrefix !== namePrefix));
    };
    const loadBuildingsAndRoads = async (bounds, currentPolygonAreas) => {
        setPolygonAreas(currentPolygonAreas);
        setIsLoadingBuildings(true);
        setIsLoadingRoads(true);
        try {
            const buildings = await fetchBuildingsInsideArea(bounds, currentPolygonAreas);
            setBuildingData(buildings);
        }
        catch (error) {
            console.error("Gagal mengambil data bangunan:", error);
            setBuildingData(null);
        }
        finally {
            setIsLoadingBuildings(false);
        }
        try {
            const rawRoads = await fetchRawRoadsInsideArea(bounds);
            setRawRoadData(rawRoads);
            const { filteredRoads, firstDetectedWidth } = createFilteredRoads(rawRoads, currentPolygonAreas, getCustomRoadWidth());
            setRoadData(filteredRoads);
            setDetectedRoadWidthMeter(firstDetectedWidth);
            if (firstDetectedWidth && !roadWidthMeter) {
                setRoadWidthMeter(String(firstDetectedWidth));
            }
        }
        catch (error) {
            console.error("Gagal mengambil data jalan:", error);
            setRawRoadData(null);
            setRoadData(null);
        }
        finally {
            setIsLoadingRoads(false);
        }
    };
    const fitMapAndLoadOsmData = () => {
        if (!visibleGeoData || hasFitBoundsRef.current)
            return;
        if (mapRef.current && geoJsonRef.current) {
            const bounds = geoJsonRef.current.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 18,
                });
                hasFitBoundsRef.current = true;
                const currentPolygonAreas = getPolygonAreas(visibleGeoData);
                loadBuildingsAndRoads(bounds, currentPolygonAreas);
            }
        }
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedRoadWidth(roadWidthMeter);
        }, 500);
        return () => clearTimeout(handler);
    }, [roadWidthMeter]);
    useEffect(() => {
        if (!rawRoadData || !polygonAreas)
            return;
        const parsed = parseFloat(debouncedRoadWidth);
        const customWidth = (!Number.isNaN(parsed) && parsed > 0) ? parsed : null;
        const { filteredRoads } = createFilteredRoads(rawRoadData, polygonAreas, customWidth);
        setRoadData(filteredRoads);
    }, [debouncedRoadWidth, rawRoadData, polygonAreas]);
    const downloadDxf = () => {
        const dxfContent = generateDxfContent({
            geoData,
            buildingData,
            roadData,
            markerIconRules,
            mode: "legacy",
        });
        downloadDxfFile(dxfContent, `${inputFileName}.dxf`);
    };
    // const downloadDxf = () => {
    //   const dxfContent = generateDxfContent({
    //     geoData,
    //     buildingData,
    //     roadData,
    //     markerIconRules,
    //     mode: "modern",
    //   });
    //   downloadDxfFile(dxfContent, "map-export-modern.dxf");
    // };
    const featureCount = geoData?.features?.length || 0;
    const buildingCount = buildingData?.features?.length || 0;
    const roadCount = roadData?.features?.length || 0;
    const isLargeData = featureCount > 3000;
    const canExportDxf = featureCount > 0 || buildingCount > 0 || roadCount > 0;
    return {
        geoData,
        visibleGeoData,
        buildingData,
        roadData,
        mapType,
        setMapType,
        isLoading,
        isLoadingBuildings,
        isLoadingRoads,
        markerIconRules,
        markerNamePrefix,
        markerIconUrl,
        setMarkerNamePrefix,
        setMarkerIconUrl,
        roadWidthMeter,
        setRoadWidthMeter,
        detectedRoadWidthMeter,
        geoJsonRef,
        mapRef,
        canvasRenderer,
        handleUploadKmlKmz,
        handleAddMarkerIconRule,
        handleRemoveMarkerIconRule,
        handleUploadMarkerIcon,
        fitMapAndLoadOsmData,
        downloadDxf,
        featureCount,
        buildingCount,
        roadCount,
        isLargeData,
        canExportDxf,
    };
};
