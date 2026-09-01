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
    maxNativeZoom: 19,
    maxZoom: 22,
  },
  TOPOGRAPHY: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap",
    maxNativeZoom: 17,
    maxZoom: 22,
    subdomains: ["a", "b", "c"],
  },
  DARK_GIS: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; HERE, Garmin, &copy; OpenStreetMap contributors",
    maxNativeZoom: 18,
    maxZoom: 22,
  },
  STREET: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxNativeZoom: 19,
    maxZoom: 22,
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const nasaLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  const [basemap, setBasemap] = useState<BasemapType>("SATELLITE");
  const [showNasa, setShowNasa] = useState(true);
  const [showHalos, setShowHalos] = useState(true);
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      // Center on India mountain systems with deep 22x zoom support
      const map = L.map(mapContainerRef.current, {
        center: [18.5, 77.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
        minZoom: 3,
        maxZoom: 22,
      });

      // Tile Layer with 22x upscaled deep zoom
      const cfg = BASEMAP_CONFIGS["SATELLITE"];
      const tileLayer = L.tileLayer(cfg.url, {
        maxNativeZoom: cfg.maxNativeZoom,
        maxZoom: 22,
        subdomains: cfg.subdomains || "abc",
      });

      if (tileLayer) {
        tileLayer.addTo(map);
      }

      tileLayerRef.current = tileLayer;

      // Layer groups for clean management
      const markersGroup = L.layerGroup().addTo(map);
      const nasaGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      nasaLayerRef.current = nasaGroup;

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
        maxZoom: 22,
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
      const glowColor = isCritical ? "rgba(239, 68, 68, 0.45)" : isWatch ? "rgba(245, 158, 11, 0.35)" : "rgba(16, 185, 129, 0.25)";

      // Custom high-tech glowing marker
      const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: pointer;">
          ${
            showHalos && (isCritical || isFocused)
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${glowColor}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ""
          }
          <div style="
            width: ${isFocused ? "28px" : "24px"};
            height: ${isFocused ? "28px" : "24px"};
            border-radius: 50%;
            background: #12181a;
            border: 2px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${glowColor};
            position: relative;
            z-index: 10;
            transition: all 0.2s ease;
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
          </div>
          <div style="
            position: absolute;
            top: -14px;
            background: rgba(18, 24, 26, 0.95);
            border: 1px solid ${color};
            color: ${color};
            font-size: 8.5px;
            font-family: monospace;
            font-weight: 700;
            padding: 1px 4px;
            border-radius: 3px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            z-index: 11;
            pointer-events: none;
          ">
            ${zone.id.split("-")[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: "landsora-station-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: customIcon });

      // Custom Popup Card
      const popupContent = `
        <div style="background: #141c1e; color: #f3f4f6; border-radius: 8px; padding: 12px; font-family: sans-serif; font-size: 12px; min-width: 220px; border: 1px solid #374151; box-shadow: 0 10px 25px rgba(0,0,0,0.8);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: #f9fafb; font-size: 13px; font-family: monospace;">${zone.name}</strong>
            <span style="background: ${color}20; color: ${color}; border: 1px solid ${color}60; font-size: 9px; font-weight: bold; font-family: monospace; padding: 2px 5px; border-radius: 3px;">
              ${zone.tier} ${zone.riskScore}%
            </span>
          </div>
          <div style="color: #9ca3af; font-size: 10px; font-family: monospace; margin-bottom: 8px;">
            ${zone.id} &middot; ${zone.region} &middot; ${zone.elevation}
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center; font-size: 10px; font-family: monospace; background: #0f1416; padding: 6px; border-radius: 6px; border: 1px solid #263238; margin-bottom: 8px;">
            <div><span style="color: #6b7280; font-size: 8px; display: block;">RAIN</span><b style="color: #60a5fa;">${zone.rainfall}mm</b></div>
            <div><span style="color: #6b7280; font-size: 8px; display: block;">SOIL</span><b style="color: #f59e0b;">${zone.soil}%</b></div>
            <div><span style="color: #6b7280; font-size: 8px; display: block;">TILT</span><b style="color: #c084fc;">${zone.tilt}&deg;</b></div>
          </div>
          <div style="font-size: 10px; color: #d1d5db; line-height: 1.3; font-style: italic; margin-bottom: 6px;">
            ${zone.geology}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "landsora-leaflet-popup",
        closeButton: true,
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
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2px dashed #38bdf8; animation: spin 4s linear infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></div>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: "analysis-crosshair-icon",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
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

  // Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetOverview = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([18.5, 77.0], 6, { animate: true });
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#101719] border border-stone-800 rounded-xl shadow-2xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-[10000] rounded-none" : "h-[580px] sm:h-[660px] lg:h-[720px] xl:h-[760px] 2xl:h-[820px] min-h-[520px]"
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
