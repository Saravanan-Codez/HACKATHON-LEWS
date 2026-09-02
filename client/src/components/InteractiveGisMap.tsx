/*
 * =========================================================================================
 * LANDSORA REAL LEAFLET GIS SATELLITE & TERRAIN MAP ENGINE
 * Real-world interactive satellite imagery, topographic contour tiles, and dark GIS vector layers
 * for India's vulnerable mountain belts (Western Ghats & Himalayas).
 * =========================================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Radio,
  Eye,
  EyeOff,
  Navigation,
  MapPin,
  X,
  Crosshair,
} from "lucide-react";

export type GisZone = {
  id: string;
  name: string;
  region: string;
  coords: string;
  lat: number;
  lng: number;
  rainfall: number;
  soil: number;
  tilt: number;
  riskScore: number;
  tier: "STABLE" | "WATCH" | "CRITICAL";
  elevation: string;
  geology: string;
};

export type NasaEvent = {
  id: string;
  title: string;
  date: string;
  latitude: number;
  longitude: number;
  category?: string;
};

export interface InteractiveGisMapProps {
  zones: GisZone[];
  selectedZoneId?: string;
  focusedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  onMapClickPoint?: (point: { latitude: number; longitude: number; simulatedScore?: number }) => void;
  selectedPoint?: { latitude: number; longitude: number; simulatedScore?: number } | null;
  nasaEvents?: NasaEvent[];
  className?: string;
  onAnalysisPinSelect?: (coords: { lat: number; lng: number; simulatedScore: number }) => void;
}

type BasemapType = "SATELLITE" | "TOPOGRAPHY" | "DARK_GIS" | "STREET";

const BASEMAP_CONFIGS: Record<BasemapType, { url: string; attribution: string; maxNativeZoom: number; maxZoom: number; subdomains?: string[] }> = {
  SATELLITE: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; Earthstar Geographics & USGS",
    maxNativeZoom: 18,
    maxZoom: 19,
  },
  TOPOGRAPHY: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap",
    maxNativeZoom: 17,
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  DARK_GIS: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; HERE, Garmin, &copy; OpenStreetMap contributors",
    maxNativeZoom: 16,
    maxZoom: 19,
  },
  STREET: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxNativeZoom: 19,
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
};

export function InteractiveGisMap({
  zones,
  selectedZoneId,
  focusedZoneId,
  onSelectZone,
  onMapClickPoint,
  selectedPoint,
  nasaEvents = [],
  className = "",
  onAnalysisPinSelect,
}: InteractiveGisMapProps) {
  const activeZoneId = selectedZoneId || focusedZoneId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const nasaLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const evacuationLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  const [basemap, setBasemap] = useState<BasemapType>("SATELLITE");
  const [showNasa, setShowNasa] = useState(true);
  const [showHalos, setShowHalos] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showEvacuation, setShowEvacuation] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 13.0,
    lng: 76.5,
    zoom: 6,
  });
  const [analysisPin, setAnalysisPin] = useState<{ lat: number; lng: number; risk: number } | null>(null);

  // Sync selectedPoint with analysisPin
  useEffect(() => {
    if (selectedPoint) {
      setAnalysisPin({
        lat: selectedPoint.latitude,
        lng: selectedPoint.longitude,
        risk: selectedPoint.simulatedScore || 65,
      });
    }
  }, [selectedPoint]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      // Center on India mountain systems with clean upscaled zoom support
      const map = L.map(mapContainerRef.current, {
        center: [18.5, 77.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 19,
      });

      // Tile Layer with safe maxNativeZoom and upscaled zoom
      const cfg = BASEMAP_CONFIGS["SATELLITE"];
      const tileLayer = L.tileLayer(cfg.url, {
        maxNativeZoom: cfg.maxNativeZoom,
        maxZoom: 19,
        subdomains: cfg.subdomains || "abc",
      });

      if (tileLayer) {
        tileLayer.addTo(map);
      }

      tileLayerRef.current = tileLayer;

      // Layer groups for clean management
      const markersGroup = L.layerGroup().addTo(map);
      const nasaGroup = L.layerGroup().addTo(map);
      const heatmapGroup = L.layerGroup().addTo(map);
      const evacuationGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      nasaLayerRef.current = nasaGroup;
      heatmapLayerRef.current = heatmapGroup;
      evacuationLayerRef.current = evacuationGroup;

      // Track mouse coordinates
      map.on("mousemove", (e: L.LeafletMouseEvent) => {
        setMouseCoords({
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4)),
          zoom: map.getZoom(),
        });
      });

      // Map click for custom analysis pin
      map.on("click", (e: L.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(4));
        const lng = Number(e.latlng.lng.toFixed(4));

        // Calculate simulated risk based on proximity to mountain stations
        let minDist = 999;
        let baseRisk = 45;
        zones.forEach((z) => {
          const d = Math.sqrt(Math.pow(z.lat - lat, 2) + Math.pow(z.lng - lng, 2));
          if (d < minDist) {
            minDist = d;
            baseRisk = z.riskScore;
          }
        });
        const simulatedScore = Math.min(98, Math.max(12, Math.round(baseRisk - minDist * 8 + (Math.sin(lat * 10) * 8))));

        setAnalysisPin({ lat, lng, risk: simulatedScore });

        if (onMapClickPoint) {
          onMapClickPoint({ latitude: lat, longitude: lng, simulatedScore });
        }
        if (onAnalysisPinSelect) {
          onAnalysisPinSelect({ lat, lng, simulatedScore });
        }
      });

      mapInstanceRef.current = map;

      // Trigger resize after layout settle
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // no-op: some browser contexts block map invalidation during load
        }
      }, 200);

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (error) {
      console.warn("Leaflet map failed to initialize; falling back to static dashboard mode.", error);
    }
  }, []);

  // Update Basemap Tiles when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      const cfg = BASEMAP_CONFIGS[basemap];
      const newTile = L.tileLayer(cfg.url, {
        maxNativeZoom: cfg.maxNativeZoom,
        maxZoom: 19,
        subdomains: cfg.subdomains || "abc",
      });

      if (newTile) {
        newTile.addTo(map);
      }

      tileLayerRef.current = newTile;
    } catch (error) {
      console.warn("Basemap update failed; continuing with the current map layer.", error);
    }
  }, [basemap]);

  // Render & Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    zones.forEach((zone) => {
      const isFocused = activeZoneId === zone.id;
      const isCritical = zone.tier === "CRITICAL";
      const isWatch = zone.tier === "WATCH";

      const color = isCritical ? "#ef4444" : isWatch ? "#f59e0b" : "#10b981";
      const glowColor = isCritical ? "rgba(239, 68, 68, 0.5)" : isWatch ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.35)";

      // Simple, clean, noticeable small dot marker
      const html = `
        <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer;">
          ${isFocused ? `<div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid ${color}; opacity: 0.7;"></div>` : ""}
          <div style="
            width: ${isFocused ? "13px" : "11px"};
            height: ${isFocused ? "13px" : "11px"};
            border-radius: 50%;
            background: ${color};
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.85), 0 0 8px ${glowColor};
            transition: transform 0.15s ease;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: "landsora-dot-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: customIcon });

      // Clean Hover Tooltip with Details
      const tooltipContent = `
        <div style="background: rgba(16, 23, 25, 0.96); backdrop-filter: blur(8px); border: 1px solid ${color}; color: #f3f4f6; padding: 7px 11px; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.75); min-width: 175px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <strong style="color: #ffffff; font-size: 11.5px; font-weight: 700;">${zone.name}</strong>
            <span style="background: ${color}25; color: ${color}; border: 1px solid ${color}80; font-size: 9px; font-weight: 800; font-family: monospace; padding: 1px 5px; border-radius: 4px;">
              ${zone.tier} ${zone.riskScore}%
            </span>
          </div>
          <div style="color: #9ca3af; font-size: 9.5px; font-family: monospace; margin-bottom: 5px;">
            ${zone.id} &bull; ${zone.region}
          </div>
          <div style="display: flex; gap: 8px; font-size: 9.5px; font-family: monospace; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 4px;">
            <span>Rain: <b style="color: #60a5fa;">${zone.rainfall}mm</b></span>
            <span>Soil: <b style="color: #f59e0b;">${zone.soil}%</b></span>
            <span>Tilt: <b style="color: #c084fc;">${zone.tilt}&deg;</b></span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: [0, -10],
        opacity: 1,
        className: "landsora-leaflet-tooltip",
      });

      marker.on("click", () => {
        if (onSelectZone) onSelectZone(zone.id);
      });

      group.addLayer(marker);
    });
  }, [zones, activeZoneId, showHalos, onSelectZone]);

  // Fly to focused zone
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeZoneId) return;

    const target = zones.find((z) => z.id === activeZoneId);
    if (target) {
      map.flyTo([target.lat, target.lng], 11, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [activeZoneId, zones]);

  // Render NASA EONET Incidents
  useEffect(() => {
    const group = nasaLayerRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showNasa) return;

    nasaEvents.forEach((ev) => {
      const circle = L.circleMarker([ev.latitude, ev.longitude], {
        radius: 8,
        fillColor: "#ef4444",
        color: "#fca5a5",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.6,
      });

      circle.bindPopup(`
        <div style="background: #141c1e; color: #f3f4f6; padding: 10px; font-size: 11px; font-family: sans-serif; border: 1px solid #ef4444; border-radius: 6px;">
          <strong style="color: #ef4444; font-size: 12px; display: block; margin-bottom: 4px;">🛰️ NASA EONET EVENT</strong>
          <div style="font-weight: bold; margin-bottom: 3px;">${ev.title}</div>
          <div style="color: #9ca3af; font-family: monospace; font-size: 10px;">${ev.date} &middot; ${ev.category}</div>
          <div style="color: #9ca3af; font-family: monospace; font-size: 9px; margin-top: 4px;">${ev.latitude.toFixed(4)}&deg;N, ${ev.longitude.toFixed(4)}&deg;E</div>
        </div>
      `);

      group.addLayer(circle);
    });
  }, [nasaEvents, showNasa]);

  // Render Analysis Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pinMarkerRef.current) {
      map.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }

    if (analysisPin) {
      const pinHtml = `
        <div style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(8, 51, 68, 0.94);
            backdrop-filter: blur(8px);
            border: 1.5px solid #38bdf8;
            color: #ffffff;
            padding: 2px 7px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 8px rgba(56, 189, 248, 0.4);
            font-family: var(--font-mono, monospace);
            font-size: 10.5px;
            font-weight: 700;
            white-space: nowrap;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 5px #38bdf8;"></span>
            <span>PIN ${analysisPin.risk}%</span>
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: "analysis-crosshair-icon",
        iconSize: [60, 20],
        iconAnchor: [30, 10],
      });

      const marker = L.marker([analysisPin.lat, analysisPin.lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="background: #141c1e; color: #f3f4f6; padding: 10px; font-size: 11px; font-family: sans-serif; border: 1px solid #38bdf8; border-radius: 6px;">
          <strong style="color: #38bdf8; font-size: 12px; display: block; margin-bottom: 2px;">📍 ANALYSIS POINT</strong>
          <div style="color: #9ca3af; font-family: monospace; font-size: 10px; margin-bottom: 4px;">
            ${analysisPin.lat}&deg;N, ${analysisPin.lng}&deg;E
          </div>
          <div style="background: #0f1416; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #f59e0b; font-weight: bold;">
            ESTIMATED RISK: ${analysisPin.risk}%
          </div>
        </div>
      `).openPopup();

      pinMarkerRef.current = marker;
    }
  }, [analysisPin]);

  // Render Landslide Susceptibility Heatmap Canvas Layer
  useEffect(() => {
    const group = heatmapLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showHeatmap) return;

    zones.forEach((z) => {
      const isCritical = z.tier === "CRITICAL";
      const isWatch = z.tier === "WATCH";
      const color = isCritical ? "#ef4444" : isWatch ? "#f59e0b" : "#10b981";
      const radius = (z.riskScore / 100) * 8000 + 3000;

      const outerGlow = L.circle([z.lat, z.lng], {
        radius,
        color: "transparent",
        fillColor: color,
        fillOpacity: isCritical ? 0.16 : isWatch ? 0.10 : 0.05,
        weight: 0,
      });
      group.addLayer(outerGlow);

      const coreGlow = L.circle([z.lat, z.lng], {
        radius: radius * 0.45,
        color: color,
        weight: 1,
        opacity: 0.25,
        fillColor: color,
        fillOpacity: isCritical ? 0.25 : 0.12,
      });
      group.addLayer(coreGlow);
    });
  }, [zones, showHeatmap]);

  // Render Evacuation Shelters & Safe Corridors Layer
  useEffect(() => {
    const group = evacuationLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showEvacuation) return;

    const EVACUATION_SHELTERS = [
      { id: "SHELTER-KDG", name: "Coorg Valley High Ground Shelter", lat: 12.48, lng: 75.82, type: "PRIMARY RELIEF CAMP", capacity: "1,200 Persons" },
      { id: "SHELTER-WYD", name: "Wayanad Disaster Relief Center", lat: 11.68, lng: 76.18, type: "MEDICAL & EVACUATION HUB", capacity: "2,500 Persons" },
      { id: "SHELTER-IDK", name: "Idukki Ridge Safe Pavilion", lat: 9.92, lng: 77.02, type: "HELIPAD & EMERGENCY REFUGE", capacity: "800 Persons" },
      { id: "SHELTER-NIL", name: "Nilgiris High Plateau Cantonment", lat: 11.42, lng: 76.78, type: "COMMUNITY SHELTER", capacity: "1,500 Persons" },
    ];

    EVACUATION_SHELTERS.forEach((shelter) => {
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="width: 26px; height: 26px; border-radius: 6px; background: #064e3b; border: 2px solid #34d399; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(52, 211, 153, 0.6); font-size: 13px;">
            🛡️
          </div>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: "evac-shelter-icon", iconSize: [32, 32], iconAnchor: [16, 16] });
      const marker = L.marker([shelter.lat, shelter.lng], { icon });
      marker.bindPopup(`
        <div style="background: #0f172a; color: #f8fafc; padding: 10px; font-size: 11px; border: 1px solid #10b981; border-radius: 6px; min-width: 200px;">
          <strong style="color: #34d399; font-size: 12px; display: block; margin-bottom: 2px;">🛡️ ${shelter.name}</strong>
          <div style="color: #94a3b8; font-family: monospace; font-size: 10px;">${shelter.type}</div>
          <div style="color: #cbd5e1; font-size: 10px; margin-top: 4px;">CAPACITY: <b style="color: #6ee7b7;">${shelter.capacity}</b></div>
        </div>
      `);
      group.addLayer(marker);
    });

    // Safe evacuation corridors (Polyline dashed paths from high risk nodes to nearest shelters)
    const corridors = [
      [[12.3375, 75.8069], [12.48, 75.82]],
      [[11.55, 76.13], [11.68, 76.18]],
      [[9.85, 76.95], [9.92, 77.02]],
    ];
    corridors.forEach((path) => {
      const line = L.polyline(path as L.LatLngExpression[], {
        color: "#34d399",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.85,
      });
      group.addLayer(line);
    });
  }, [showEvacuation]);

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetOverview = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([18.5, 77.0], 6, { animate: true });
  };

  const toggleFullscreen = () => {
    const isCurrentlyFs = Boolean(document.fullscreenElement);
    if (!isCurrentlyFs) {
      if (wrapperRef.current?.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(() => {
          setIsFullscreen((prev) => !prev);
        });
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 350);
  };

  const activeZone = zones.find((z) => z.id === activeZoneId) || zones[0];

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden bg-[#101719] border border-stone-800 rounded-xl shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-[99999] w-screen h-screen rounded-none" : "h-[580px] sm:h-[660px] lg:h-[720px] xl:h-[760px] 2xl:h-[820px] min-h-[520px]"
      } ${className}`}
    >
      {/* 1. REAL LEAFLET MAP CANVAS */}
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ background: "#101719" }} />

      {/* 2. TOP FLOATING CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Basemap Mode Switcher */}
        <div className="flex items-center gap-1 bg-stone-900/95 backdrop-blur-md p-1 rounded-lg border border-stone-700/80 shadow-lg pointer-events-auto">
          <Layers size={13} className="text-stone-400 ml-1.5 mr-0.5" />
          {(["SATELLITE", "TOPOGRAPHY", "DARK_GIS", "STREET"] as BasemapType[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBasemap(mode)}
              className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all ${
                basemap === mode
                  ? "bg-amber-500 text-stone-950 shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/80"
              }`}
            >
              {mode.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Action Controls & Layer Toggles */}
        <div className="flex items-center gap-1.5 bg-stone-900/95 backdrop-blur-md p-1 rounded-lg border border-stone-700/80 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowHeatmap((prev) => !prev)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
              showHeatmap ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Toggle Landslide Susceptibility Heatmap"
          >
            <span>🔥 HEATMAP</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEvacuation((prev) => !prev)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
              showEvacuation ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Toggle Safe Relief Camps & Evacuation Corridors"
          >
            <span>🛡️ EVACUATION</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProfileDrawer((prev) => !prev)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
              showProfileDrawer ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Toggle Topographic Elevation & Slip Plane Profile"
          >
            <span>📐 PROFILE</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNasa((prev) => !prev)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
              showNasa ? "bg-red-500/20 text-red-300 border border-red-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Toggle live NASA EONET disaster feeds"
          >
            <Radio size={11} className={showNasa ? "text-red-400 animate-pulse" : "text-stone-500"} />
            <span>NASA ({nasaEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHalos((prev) => !prev)}
            className={`p-1.5 rounded text-stone-300 hover:text-white transition-colors ${
              showHalos ? "text-amber-400" : "text-stone-500"
            }`}
            title={showHalos ? "Disable risk pulse rings" : "Enable risk pulse rings"}
          >
            {showHalos ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          <div className="h-4 w-px bg-stone-700 mx-0.5" />

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetOverview}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Reset to India Overview"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-stone-800 text-amber-300 hover:text-amber-200 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen GIS Map"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* TOPOGRAPHIC CROSS-SECTION DRAWER (WHEN PROFILE ACTIVE) */}
      {showProfileDrawer && activeZone && (
        <div className="absolute top-14 left-3 right-3 z-[1000] p-3.5 rounded-xl bg-stone-950/95 backdrop-blur-md border border-cyan-500/40 shadow-2xl space-y-2 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-bold flex items-center gap-1.5">
              <span>📐</span> {activeZone.name} — TOPOGRAPHIC CROSS-SECTION & SLIP SURFACE
            </span>
            <div className="flex items-center gap-3">
              <span className="text-stone-400">ELEVATION: <b className="text-stone-200">{activeZone.elevation}</b></span>
              <span className="text-stone-400">GEOLOGY: <b className="text-amber-300">{activeZone.geology}</b></span>
              <button
                type="button"
                onClick={() => setShowProfileDrawer(false)}
                className="text-stone-400 hover:text-white p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="relative h-20 w-full bg-stone-900/90 rounded-lg overflow-hidden border border-stone-800 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 500 80" preserveAspectRatio="none">
              <polygon points="0,80 500,80 500,50 350,30 200,20 0,60" fill="#1e292d" />
              <polygon points="0,60 200,20 350,30 500,50 500,42 350,22 200,12 0,52" fill={activeZone.riskScore > 75 ? "#7f1d1d" : activeZone.riskScore > 45 ? "#78350f" : "#064e3b"} />
              <line x1="0" y1="52" x2="500" y2="42" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,4" />
            </svg>
            <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-300">
              Active Slip Surface (Depth: ~3.8m &middot; Inclinometer Tilt: {activeZone.tilt}&deg;/hr)
            </div>
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-stone-300">
              Risk Surface: <b className={activeZone.riskScore > 75 ? "text-red-400" : activeZone.riskScore > 45 ? "text-amber-400" : "text-emerald-400"}>{activeZone.riskScore}/100 ({activeZone.tier})</b>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM HUD COORDINATES & STATUS BAR */}
      <div className="absolute bottom-2.5 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Telemetry HUD */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone-900/90 backdrop-blur-md border border-stone-800 text-[10px] font-mono text-stone-300 pointer-events-auto">
          <Navigation size={11} className="text-amber-400 animate-spin-slow" />
          <span>
            LAT: <b>{mouseCoords.lat}&deg;N</b> &middot; LNG: <b>{mouseCoords.lng}&deg;E</b>
          </span>
          <span className="text-stone-500">|</span>
          <span className="text-stone-400">ZOOM: {mouseCoords.zoom}x</span>
        </div>

        {/* Right Active Stations Legend */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone-900/90 backdrop-blur-md border border-stone-800 text-[10px] font-mono pointer-events-auto">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> STABLE
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> WATCH
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> CRITICAL
          </span>
          {analysisPin && (
            <button
              type="button"
              onClick={() => setAnalysisPin(null)}
              className="text-[9px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-cyan-900/60"
            >
              <span>PIN {analysisPin.risk}%</span>
              <X size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
