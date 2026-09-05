import React, { useState } from "react";
import {
  X,
  CloudRain,
  Wind,
  Compass,
  Sun,
  Sunset,
  Sunrise,
  Gauge,
  Droplets,
  Cloud,
  Thermometer,
  ShieldAlert,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Waves,
  Activity,
  Layers,
  AlertTriangle,
  Eye,
  Zap,
} from "lucide-react";
import type { LiveTelemetrySnapshot } from "../../../server/services/liveTelemetryService";

interface LiveMeteorologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: LiveTelemetrySnapshot | null;
  stationName: string;
  stationRegion: string;
  countryFlag?: string;
  elevation?: string;
  coords?: string;
}

export function LiveMeteorologyModal({
  isOpen,
  onClose,
  data,
  stationName,
  stationRegion,
  countryFlag = "📍",
  elevation = "1,150m MSL",
  coords = "",
}: LiveMeteorologyModalProps) {
  const [activeTab, setActiveTab] = useState<
    "ATMOSPHERE" | "HYDROLOGY" | "AIR_QUALITY" | "SOIL_STRATA" | "HOURLY_24H" | "DAILY_7D" | "GEOTECH"
  >("ATMOSPHERE");

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Atmospheric core
  const temp = data?.temperatureC ?? 22.0;
  const apparentTemp = data?.apparentTemperatureC ?? 23.1;
  const condition = data?.weatherLabel ?? "Partly Cloudy";
  const icon = data?.weatherIcon ?? "⛅";
  const rainRate = data?.rainfallMmHr ?? 0.0;
  const rain24h = data?.accumulatedRain24hMm ?? 0.0;
  const humidity = data?.relativeHumidityPct ?? 80;
  const dewPoint = data?.dewPointC ?? 18.5;
  const pressure = data?.surfacePressureHpa ?? 1013.2;
  const pressureTendency = data?.pressureTendency3hHpa ?? 0.0;
  const windSpeed = data?.windSpeedKmh ?? 12.0;
  const windGusts = data?.windGustsKmh ?? 18.0;
  const windCompass = data?.windDirectionCompass ?? "SW";
  const windDeg = data?.windDirectionDeg ?? 225;
  const uvIndex = data?.uvIndex ?? 5.5;
  const cloudCover = data?.cloudCoverPct ?? 50;
  const sunrise = data?.sunrise ?? "06:15";
  const sunset = data?.sunset ?? "18:30";
  const hourly = data?.hourly24h ?? [];
  const daily = data?.sevenDayForecast ?? [];
  const alerts = data?.meteorologicalAlerts ?? [];

  // Expanded Open-Meteo fields
  const visibility = data?.visibilityMeters ?? 10000;
  const et0 = data?.et0FaoMm ?? 3.8;
  const evapotranspiration = data?.evapotranspirationMm ?? 0.42;
  const vpd = data?.vapourPressureDeficitKpa ?? 0.65;
  const solarWatts = data?.solarRadiationWatts ?? 540;
  const directWatts = data?.directRadiationWatts ?? 380;
  const diffuseWatts = data?.diffuseRadiationWatts ?? 160;
  const wind80m = data?.windSpeed80mKmh ?? 18.2;
  const wind120m = data?.windSpeed120mKmh ?? 22.4;
  const daylightHrs = data?.daylightDurationSeconds ? (data.daylightDurationSeconds / 3600).toFixed(1) : "12.2";
  const sunshineHrs = data?.sunshineDurationSeconds ? (data.sunshineDurationSeconds / 3600).toFixed(1) : "7.4";

  // Hydrology
  const hydro = data?.hydrology;
  const riverDischarge = hydro?.riverDischargeM3s ?? 0.85;
  const riverMax = hydro?.riverDischargeMaxM3s ?? 1.2;
  const riverMean = hydro?.riverDischargeMeanM3s ?? 0.78;
  const floodRisk = hydro?.floodRiskLevel ?? "LOW";
  const riverForecast = hydro?.dailyDischargeForecast ?? [];

  // Air Quality
  const aq = data?.airQuality;
  const usAqi = aq?.usAqi ?? 42;
  const euAqi = aq?.europeanAqi ?? 35;
  const pm25 = aq?.pm25 ?? 9.5;
  const pm10 = aq?.pm10 ?? 18.2;
  const dust = aq?.dust ?? 4.2;
  const aod = aq?.aerosolOpticalDepth ?? 0.12;
  const co = aq?.carbonMonoxide ?? 280;
  const no2 = aq?.nitrogenDioxide ?? 14.5;
  const so2 = aq?.sulphurDioxide ?? 3.8;
  const o3 = aq?.ozone ?? 45.2;
  const aqLevel = aq?.qualityLevel ?? "GOOD";

  // Subsurface Soil Profiles
  const sm = data?.soilMoistureProfile;
  const st = data?.soilTemperatureProfile;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#0c1015] border border-amber-500/40 rounded-none shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden font-mono text-stone-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121920]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{countryFlag}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">{stationName}</h2>
                <span className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  METEOROLOGICAL RADAR
                </span>
                <span className="px-2 py-0.5 rounded-none text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  OPEN-METEO MULTI-MODEL LIVE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                {stationRegion} &bull; {elevation} &bull; [{coords}]
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-700 transition-colors"
            title="Close Meteorology Station"
          >
            <X size={16} />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#090d11] border-b border-white/10 overflow-x-auto scrollbar-none">
          {[
            { id: "ATMOSPHERE", label: "🌦️ ATMOSPHERE" },
            { id: "HYDROLOGY", label: "🌊 RIVER & FLOOD" },
            { id: "AIR_QUALITY", label: "💨 AIR QUALITY & AEROSOLS" },
            { id: "SOIL_STRATA", label: "🌱 SOIL STRATIGRAPHY" },
            { id: "HOURLY_24H", label: "⏱️ 24-HR TIMELINE" },
            { id: "DAILY_7D", label: "📅 7-DAY OUTLOOK" },
            { id: "GEOTECH", label: "⛰️ HYDRO-GEOTECHNICAL LINK" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-amber-500 text-stone-950 shadow-sm border border-amber-400"
                  : "bg-white/[0.03] text-stone-400 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          
          {/* TAB 1: ATMOSPHERE */}
          {activeTab === "ATMOSPHERE" && (
            <div className="space-y-4">
              {/* TOP HERO WEATHER CARD */}
              <div className="p-4 sm:p-5 rounded-none bg-gradient-to-r from-[#141e24] via-[#10171d] to-[#0c1216] border border-cyan-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl drop-shadow-md">{icon}</span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white tracking-tight">{temp}°C</span>
                      <span className="text-xs text-stone-400 font-mono">Feels like <b>{apparentTemp}°C</b></span>
                    </div>
                    <div className="text-sm font-semibold text-cyan-300 mt-0.5">{condition}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-stone-300">
                  <div className="bg-black/50 p-2.5 rounded-none border border-white/10 text-center min-w-[90px]">
                    <span className="text-[10px] text-stone-400 block">PRECIP RATE</span>
                    <strong className="text-sky-300 text-sm">{rainRate.toFixed(1)} mm/h</strong>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-none border border-white/10 text-center min-w-[90px]">
                    <span className="text-[10px] text-stone-400 block">24H ACCUM</span>
                    <strong className="text-sky-300 text-sm">{rain24h.toFixed(1)} mm</strong>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-none border border-white/10 text-center min-w-[90px]">
                    <span className="text-[10px] text-stone-400 block">HUMIDITY</span>
                    <strong className="text-emerald-300 text-sm">{humidity}%</strong>
                  </div>
                  <div className="bg-black/50 p-2.5 rounded-none border border-white/10 text-center min-w-[90px]">
                    <span className="text-[10px] text-stone-400 block">SURFACE PRESS</span>
                    <strong className="text-amber-300 text-sm">{pressure.toFixed(1)} hPa</strong>
                  </div>
                </div>
              </div>

              {/* ATMOSPHERIC DETAILED METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {/* Dew Point */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Thermometer size={12} className="text-cyan-400" /> DEW POINT
                  </span>
                  <strong className="text-base text-white">{dewPoint}°C</strong>
                  <span className="text-[9.5px] text-stone-500 block">VPD: {vpd} kPa</span>
                </div>

                {/* Wind Shear Profile */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Wind size={12} className="text-sky-400" /> WIND GRADIENT
                  </span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-base text-white">{windSpeed} km/h</strong>
                    <span className="text-amber-400 font-bold">{windCompass} ({windDeg}°)</span>
                  </div>
                  <span className="text-[9.5px] text-stone-500 block">80m: {wind80m}k &bull; 120m: {wind120m}k</span>
                </div>

                {/* Solar Radiation */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Sun size={12} className="text-yellow-400" /> SOLAR IRRADIANCE
                  </span>
                  <strong className="text-base text-yellow-300">{solarWatts} W/m²</strong>
                  <span className="text-[9.5px] text-stone-500 block">Direct: {directWatts}W &bull; Diffuse: {diffuseWatts}W</span>
                </div>

                {/* Evapotranspiration */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Droplets size={12} className="text-emerald-400" /> EVAPOTRANSPIRATION
                  </span>
                  <strong className="text-base text-emerald-300">{et0} mm/day</strong>
                  <span className="text-[9.5px] text-stone-500 block">FAO-56 Penman-Monteith ref ET₀</span>
                </div>

                {/* Visibility */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Eye size={12} className="text-purple-400" /> VISIBILITY
                  </span>
                  <strong className="text-base text-white">{(visibility / 1000).toFixed(1)} km</strong>
                  <span className="text-[9.5px] text-stone-500 block">Optical horizontal range</span>
                </div>

                {/* Cloud Stratification */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Cloud size={12} className="text-stone-300" /> CLOUD LAYERS
                  </span>
                  <strong className="text-base text-stone-200">{cloudCover}%</strong>
                  <span className="text-[9.5px] text-stone-500 block">Low: {data?.cloudCoverLowPct ?? 20}% &bull; High: {data?.cloudCoverHighPct ?? 35}%</span>
                </div>

                {/* Daylight & Sun Times */}
                <div className="p-3 bg-[#11171d] border border-white/10 rounded-none space-y-1 col-span-2">
                  <span className="text-stone-400 text-[10px] block flex items-center gap-1">
                    <Sunrise size={12} className="text-amber-400" /> SOLAR EPHEMERIS
                  </span>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span>Sunrise: <b className="text-amber-300">{sunrise}</b></span>
                    <span>Sunset: <b className="text-amber-400">{sunset}</b></span>
                    <span>Daylight: <b className="text-white">{daylightHrs}h</b></span>
                    <span>Sunshine: <b className="text-yellow-300">{sunshineHrs}h</b></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HYDROLOGY & FLOOD DISCHARGE */}
          {activeTab === "HYDROLOGY" && (
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-[#111a20] border border-cyan-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Waves size={15} className="text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      OPEN-METEO GLOBAL FLOOD API & RIVER DISCHARGE HYDROGRAPH
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold border ${
                    floodRisk === "CRITICAL" ? "bg-red-500/20 text-red-300 border-red-500/40" :
                    floodRisk === "HIGH" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                    floodRisk === "MODERATE" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" :
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}>
                    FLOOD RISK: {floodRisk}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">CURRENT DISCHARGE</span>
                    <strong className="text-xl text-cyan-300 block mt-1">{riverDischarge} m³/s</strong>
                    <span className="text-[9.5px] text-stone-500">Volumetric river runoff</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">PEAK DISCHARGE (7D)</span>
                    <strong className="text-xl text-amber-300 block mt-1">{riverMax} m³/s</strong>
                    <span className="text-[9.5px] text-stone-500">Maximum crest runoff</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">MEAN DISCHARGE</span>
                    <strong className="text-xl text-stone-200 block mt-1">{riverMean} m³/s</strong>
                    <span className="text-[9.5px] text-stone-500">7-day hydraulic baseline</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">SLOPE TOE EROSION RISK</span>
                    <strong className={`text-xl block mt-1 ${riverDischarge > 2.5 ? "text-red-400" : "text-emerald-300"}`}>
                      {riverDischarge > 2.5 ? "HIGH" : "CONTROLLED"}
                    </strong>
                    <span className="text-[9.5px] text-stone-500">Hydraulic undercut index</span>
                  </div>
                </div>

                {/* 7-DAY HYDROGRAPH FORECAST CARDS */}
                <div className="pt-2">
                  <span className="text-stone-400 text-[10px] block uppercase mb-2">
                    7-DAY VOLUMETRIC RIVER DISCHARGE FORECAST (m³/s)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {riverForecast.map((f, i) => (
                      <div key={i} className="p-2.5 bg-black/50 border border-white/10 rounded-none text-center">
                        <span className="text-[10px] text-stone-400 block">{f.date.slice(5)}</span>
                        <strong className="text-sm text-cyan-300 block my-0.5">{f.dischargeM3s} m³/s</strong>
                        <span className="text-[9.5px] text-stone-500">Day +{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AIR QUALITY & AEROSOLS */}
          {activeTab === "AIR_QUALITY" && (
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-[#111a20] border border-amber-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Gauge size={15} className="text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      OPEN-METEO AIR QUALITY & ATMOSPHERIC AEROSOL INDEX
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold border ${
                    usAqi > 150 ? "bg-red-500/20 text-red-300 border-red-500/40" :
                    usAqi > 100 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                    usAqi > 50 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" :
                    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}>
                    US AQI {usAqi} &bull; {aqLevel}
                  </span>
                </div>

                {/* AQI GAUGES & PARTICULATE CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">US AQI INDEX</span>
                    <strong className="text-2xl text-amber-300 block mt-1">{usAqi}</strong>
                    <span className="text-[9.5px] text-stone-500">EPA Standard Scale</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">EUROPEAN AQI</span>
                    <strong className="text-2xl text-stone-200 block mt-1">{euAqi}</strong>
                    <span className="text-[9.5px] text-stone-500">CAQI Scale</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">FINE PM2.5</span>
                    <strong className="text-2xl text-sky-300 block mt-1">{pm25} <span className="text-xs font-normal">μg/m³</span></strong>
                    <span className="text-[9.5px] text-stone-500">Respirable particles</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">COARSE PM10</span>
                    <strong className="text-2xl text-yellow-300 block mt-1">{pm10} <span className="text-xs font-normal">μg/m³</span></strong>
                    <span className="text-[9.5px] text-stone-500">Inhalable dust</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/10 rounded-none">
                    <span className="text-stone-400 text-[10px] block">SAHARAN / ASIAN DUST</span>
                    <strong className="text-2xl text-orange-300 block mt-1">{dust} <span className="text-xs font-normal">μg/m³</span></strong>
                    <span className="text-[9.5px] text-stone-500">AOD: {aod}</span>
                  </div>
                </div>

                {/* GASEOUS TRACE CHEMICAL METRICS */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-stone-400 text-[10px] block uppercase mb-2">
                    ATMOSPHERIC TRACE GAS CONCENTRATIONS
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-none">
                      <span className="text-[10px] text-stone-400 block">CARBON MONOXIDE (CO)</span>
                      <strong className="text-sm text-stone-200">{co} μg/m³</strong>
                    </div>
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-none">
                      <span className="text-[10px] text-stone-400 block">NITROGEN DIOXIDE (NO₂)</span>
                      <strong className="text-sm text-stone-200">{no2} μg/m³</strong>
                    </div>
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-none">
                      <span className="text-[10px] text-stone-400 block">SULPHUR DIOXIDE (SO₂)</span>
                      <strong className="text-sm text-stone-200">{so2} μg/m³</strong>
                    </div>
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-none">
                      <span className="text-[10px] text-stone-400 block">TROPOSPHERIC OZONE (O₃)</span>
                      <strong className="text-sm text-stone-200">{o3} μg/m³</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSURFACE SOIL STRATIGRAPHY */}
          {activeTab === "SOIL_STRATA" && (
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-[#111a20] border border-cyan-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-cyan-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      5-STRATA MULTI-DEPTH SUBSURFACE SOIL MOISTURE & TEMPERATURE PROFILE
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20">
                    ECMWF IFS LAND MODEL SOIL REANALYSIS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* SOIL MOISTURE PROFILE */}
                  <div className="space-y-2.5 bg-black/40 p-3.5 border border-white/10 rounded-none">
                    <span className="text-xs font-bold text-amber-300 block uppercase">
                      💧 Subsurface Volumetric Soil Moisture (% m³/m³)
                    </span>
                    {[
                      { depth: "0 - 1 cm (Topsoil Boundary)", val: sm?.depth0to1cm ?? 28.5 },
                      { depth: "1 - 3 cm (Organic Rootzone)", val: sm?.depth1to3cm ?? 32.1 },
                      { depth: "3 - 9 cm (Shallow Horizon)", val: sm?.depth3to9cm ?? 35.8 },
                      { depth: "9 - 27 cm (Deep Root Layer)", val: sm?.depth9to27cm ?? 41.2 },
                      { depth: "27 - 81 cm (Subsoil / Slip Horizon)", val: sm?.depth27to81cm ?? 46.5 },
                    ].map((layer, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-300">{layer.depth}</span>
                          <strong className="text-sky-300">{layer.val}%</strong>
                        </div>
                        <div className="w-full bg-stone-900 h-2 rounded-none border border-white/10 overflow-hidden">
                          <div
                            className={`h-full ${layer.val > 60 ? "bg-red-500" : layer.val > 40 ? "bg-amber-400" : "bg-sky-400"}`}
                            style={{ width: `${Math.min(100, layer.val)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SOIL TEMPERATURE PROFILE */}
                  <div className="space-y-2.5 bg-black/40 p-3.5 border border-white/10 rounded-none">
                    <span className="text-xs font-bold text-cyan-300 block uppercase">
                      🌡️ Subsurface Ground Temperature (°C)
                    </span>
                    {[
                      { depth: "0 cm (Ground Surface)", val: st?.depth0cm ?? 22.4 },
                      { depth: "6 cm (Shallow Subsurface)", val: st?.depth6cm ?? 21.8 },
                      { depth: "18 cm (Intermediate Bed)", val: st?.depth18cm ?? 20.9 },
                      { depth: "54 cm (Deep Thermal Core)", val: st?.depth54cm ?? 19.8 },
                    ].map((layer, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-300">{layer.depth}</span>
                          <strong className="text-amber-300">{layer.val}°C</strong>
                        </div>
                        <div className="w-full bg-stone-900 h-2 rounded-none border border-white/10 overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${Math.min(100, Math.max(10, (layer.val / 40) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="p-2.5 bg-[#090e12] border border-white/10 text-[10px] text-stone-400 mt-2">
                      Deep horizon saturation at 27-81cm ($m^3/m^3$) determines matric suction loss and catastrophic pore pressure spikes along the Mohr-Coulomb slip plane.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 24-HOUR HOURLY RADAR TIMELINE */}
          {activeTab === "HOURLY_24H" && (
            <div className="space-y-4">
              <div className="p-4 rounded-none bg-[#111a20] border border-white/10">
                <h3 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} /> 24-HOUR HIGH-RESOLUTION HOURLY FORECAST MATRIX
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                  {hourly.slice(0, 16).map((h, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-none border text-center font-mono transition-all ${
                        h.precipitationMm > 0.5
                          ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200"
                          : "bg-[#0c1015] border-white/10 text-stone-300"
                      }`}
                    >
                      <span className="text-[10px] text-stone-400 block">{h.time}</span>
                      <strong className="text-sm font-bold text-white block my-1">{h.temperatureC}°C</strong>
                      
                      <div className="space-y-1 text-[9.5px] border-t border-white/10 pt-1.5">
                        <div className="flex items-center justify-between text-sky-300">
                          <span>💧 {h.precipitationProbabilityPct}%</span>
                          <span>{h.precipitationMm}mm</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-400">
                          <span>💨 {h.windSpeedKmh}k</span>
                          <span>🌱 {h.soilMoisturePct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 7-DAY EXTENDED METEOROLOGICAL FORECAST */}
          {activeTab === "DAILY_7D" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar size={14} /> 7-DAY SYNOPTIC METEOROLOGICAL OUTLOOK
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
                {daily.map((d, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-none border font-mono flex flex-col justify-between text-center transition-all ${
                      i === 0
                        ? "bg-[#142228] border-amber-500/50 shadow-lg"
                        : "bg-[#0c1015] border-white/10"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">{d.dayName}</span>
                      <span className="text-[9.5px] text-stone-400 block">{d.date.slice(5)}</span>
                      <div className="text-3xl my-2">{d.weatherIcon}</div>
                      <span className="text-[10.5px] text-stone-300 font-semibold block leading-tight min-h-[28px]">
                        {d.weatherLabel}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5 text-xs">
                      <div className="flex items-center justify-center gap-2">
                        <strong className="text-white">{d.temperatureMaxC}°</strong>
                        <span className="text-stone-400">{d.temperatureMinC}°</span>
                      </div>
                      <div className="text-[10px] text-sky-300 font-semibold">
                        🌧️ {d.precipitationSumMm} mm ({d.precipitationProbabilityMaxPct}%)
                      </div>
                      <div className="text-[9.5px] text-stone-400">
                        💨 Max: {d.windSpeedMaxKmh} km/h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: HYDRO-GEOTECHNICAL LINK */}
          {activeTab === "GEOTECH" && (
            <div className="space-y-4 font-mono">
              <div className="p-4 rounded-none bg-[#111a20] border border-cyan-500/30 space-y-3">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} /> HYDRO-METEOROLOGICAL & MOHR-COULOMB SLOPE CORRELATION
                </h3>

                <p className="text-xs text-stone-300 leading-relaxed">
                  Real-time precipitation infiltration and subsurface soil moisture saturation directly diminish effective shear strength $\tau_f = c' + (\sigma - u) \tan\phi'$ by driving up pore water pressure $u$ and extinguishing matric suction.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-none bg-black/40 border border-white/10">
                    <span className="text-[10px] text-stone-400 block">FACTOR OF SAFETY (FoS)</span>
                    <strong className="text-lg text-emerald-400 block mt-1">
                      {data?.geotechnicalAnalysis.factorOfSafety ?? 1.45}
                    </strong>
                    <span className="text-[9.5px] text-stone-500">Threshold: &lt;1.0 (Failure), &gt;1.3 (Stable)</span>
                  </div>

                  <div className="p-3 rounded-none bg-black/40 border border-white/10">
                    <span className="text-[10px] text-stone-400 block">PORE WATER PRESSURE (u)</span>
                    <strong className="text-lg text-amber-300 block mt-1">
                      {data?.geotechnicalAnalysis.poreWaterPressureKpa ?? 28} kPa
                    </strong>
                    <span className="text-[9.5px] text-stone-500">Hydrostatic + Matric Suction loss</span>
                  </div>

                  <div className="p-3 rounded-none bg-black/40 border border-white/10">
                    <span className="text-[10px] text-stone-400 block">ANTECEDENT RAIN RISK</span>
                    <strong className="text-lg text-sky-300 block mt-1">
                      {data?.geotechnicalAnalysis.antecedentRainfallRisk ?? "MODERATE"}
                    </strong>
                    <span className="text-[9.5px] text-stone-500">Based on 24h & 72h accumulated rain</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#121920] text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
            <span>Open-Meteo &bull; ECMWF IFS &bull; GFS Ensemble Synchronized</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-none bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors"
          >
            DISMISS RADAR
          </button>
        </div>

      </div>
    </div>
  );
}
