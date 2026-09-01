/* Landsora Dedicated Operational Application Dashboard: High-productivity Surveyor's Field Console */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getDataPresentation } from "@/lib/dataPresentation";
import { createQueuedReport, saveQueuedReport } from "@/lib/reportQueue";
import {
  detectLanguageForZone,
  detectLanguageFromCoords,
  getStoredNotificationLanguage,
  notificationLanguages,
  renderNotification,
  saveNotificationLanguage,
  type NotificationKind,
  type NotificationLanguage,
} from "@/lib/notificationTranslations";
import { shouldRefreshAiAnalysis } from "@/lib/aiAnalysisFlow";
import { runLiveValidation, saveQuarantineRecord, getStoredQuarantine, clearQuarantineRecords } from "@/lib/anomalyValidator";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BatteryCharging,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Compass,
  Cpu,
  Crosshair,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Gauge,
  Globe2,
  HelpCircle,
  Hospital,
  Layers3,
  Lock,
  MapPin,
  MapPinned,
  Radio,
  RefreshCw,
  RotateCcw,
  Route,
  Send,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sliders,
  Smartphone,
  Sparkles,
  Sprout,
  Trash2,
  Upload,
  User,
  Users,
  Waves,
  Wifi,
  WifiOff,
  Wind,
  X,
  XCircle,
} from "lucide-react";

const ASSET_BASE = "/assets";
const assetUrl = (file: string) => {
  const cleanName = file.replace(/_[a-f0-9]+(\.[a-z]+)$/i, "$1");
  return `${ASSET_BASE}/${cleanName}`;
};

type Tier = "STABLE" | "WATCH" | "CRITICAL";
type Zone = {
  id: string;
  name: string;
  region: string;
  coords: string;
  rainfall: number;
  soil: number;
  tilt: number;
  baseline: number;
  sensors: number;
  history: number[];
  tier: Tier;
  score: number;
  sensitivity: { rain: number; soil: number; tilt: number };
  batteryVoltage: number;
  wifiRssi: number;
};
type AlertEvent = { time: string; zone: string; transition: string; risk: number };
type EonetEvent = { id: string; title: string; date: string; latitude: number; longitude: number; source: string; status: string };
type RoadStatus = "OPEN" | "RESTRICTED" | "AT RISK" | "BLOCKED" | "UNKNOWN";

const initialZones: Zone[] = [
  { id: "CHK-01", name: "Chikkamagaluru", region: "Western Ghats", coords: "13.3153, 75.7754", rainfall: 12.8, soil: 57.4, tilt: 0.062, baseline: 31, sensors: 10, history: [31, 32, 32, 33, 32, 34, 35, 34, 35, 36, 35, 36], tier: "STABLE", score: 35, sensitivity: { rain: 0.9, soil: 0.85, tilt: 0.8 }, batteryVoltage: 3.96, wifiRssi: -58 },
  { id: "KDG-03", name: "Kodagu", region: "Western Ghats", coords: "12.3375, 75.8069", rainfall: 18.4, soil: 78.2, tilt: 0.084, baseline: 42, sensors: 12, history: [52, 55, 56, 58, 57, 60, 59, 61, 62, 60, 63, 64], tier: "WATCH", score: 64, sensitivity: { rain: 1.15, soil: 1.12, tilt: 0.9 }, batteryVoltage: 3.92, wifiRssi: -62 },
  { id: "UKA-02", name: "Uttara Kannada", region: "Western Ghats", coords: "14.7937, 74.6869", rainfall: 9.6, soil: 49.8, tilt: 0.057, baseline: 28, sensors: 9, history: [28, 29, 30, 29, 31, 30, 30, 31, 32, 31, 31, 32], tier: "STABLE", score: 32, sensitivity: { rain: 0.92, soil: 0.86, tilt: 0.82 }, batteryVoltage: 4.02, wifiRssi: -54 },
  { id: "WYD-04", name: "Wayanad", region: "Western Ghats", coords: "11.6854, 76.1320", rainfall: 15.1, soil: 71.4, tilt: 0.068, baseline: 37, sensors: 11, history: [43, 44, 45, 44, 46, 47, 48, 47, 49, 48, 49, 50], tier: "WATCH", score: 50, sensitivity: { rain: 0.92, soil: 1.18, tilt: 0.86 }, batteryVoltage: 3.88, wifiRssi: -67 },
  { id: "NLG-05", name: "Nilgiris", region: "Tamil Nadu", coords: "11.4102, 76.6950", rainfall: 11.2, soil: 53.6, tilt: 0.092, baseline: 39, sensors: 8, history: [41, 42, 41, 43, 44, 43, 45, 44, 46, 45, 47, 48], tier: "WATCH", score: 48, sensitivity: { rain: 0.88, soil: 0.9, tilt: 1.2 }, batteryVoltage: 3.82, wifiRssi: -71 },
  { id: "DJE-06", name: "Darjeeling", region: "Eastern Himalayas", coords: "27.0410, 88.2663", rainfall: 13.5, soil: 61.7, tilt: 0.101, baseline: 44, sensors: 13, history: [50, 51, 52, 51, 53, 54, 53, 55, 54, 56, 55, 57], tier: "WATCH", score: 57, sensitivity: { rain: 0.9, soil: 0.94, tilt: 1.22 }, batteryVoltage: 3.90, wifiRssi: -65 },
];

const statusColor = (tier: Tier) => tier === "CRITICAL" ? "#C24B3F" : tier === "WATCH" ? "#D6A24E" : "#6FA377";
const classify = (score: number): Tier => score >= 71 ? "CRITICAL" : score >= 40 ? "WATCH" : "STABLE";
const clock = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
const eventAgeDays = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const eventTone = (date: string) => eventAgeDays(date) <= 2 ? "very-recent" : eventAgeDays(date) <= 7 ? "recent" : eventAgeDays(date) <= 30 ? "high-interest" : "old";
const eventPosition = (event: EonetEvent, index: number) => {
  const x = Math.max(6, Math.min(94, ((event.longitude - 68) / 28) * 100));
  const y = Math.max(8, Math.min(92, (1 - ((event.latitude - 8) / 28)) * 100));
  return [Number.isFinite(x) ? x : 18 + (index % 5) * 14, Number.isFinite(y) ? y : 24 + (index % 4) * 15] as const;
};
const distanceKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const r = 6371;
  const p = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * p;
  const dLon = (b.longitude - a.longitude) * p;
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * p) * Math.cos(b.latitude * p) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
};

function calcScore(z: Zone) {
  const rain = Math.min(100, (z.rainfall / 32) * 100) * z.sensitivity.rain;
  const soil = Math.min(100, z.soil) * z.sensitivity.soil;
  const tilt = Math.min(100, (z.tilt / 0.16) * 100) * z.sensitivity.tilt;
  return Math.max(0, Math.min(100, Math.round(0.4 * rain + 0.35 * soil + 0.25 * tilt + z.baseline * 0.08)));
}

function delta(a: number, b: number) {
  const d = a - b;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}`;
}

function TinySpark({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values), max = Math.max(...values);
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${34 - ((v - min) / Math.max(1, max - min)) * 24}`).join(" ");
  const current = Math.round(values[values.length - 1]);
  return <svg className="spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label={`Risk trend ending at ${current} out of 100`}><polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>;
}

function TrendChart({ values, tier }: { values: number[]; tier: Tier }) {
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - v}`).join(" ");
  return (
    <div className="trend-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={statusColor(tier)} stopOpacity=".22" />
            <stop offset="1" stopColor={statusColor(tier)} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)" />
        <polyline points={points} fill="none" stroke={statusColor(tier)} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart-labels"><span>−16 READINGS</span><span>NOW</span></div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [zones, setZones] = useState(initialZones);
  const [selected, setSelected] = useState("KDG-03");
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState(clock());
  const [scenario, setScenario] = useState("NORMAL CONDITIONS");
  const [storm, setStorm] = useState(false);
  const [stormProgress, setStormProgress] = useState(0);
  const [ack, setAck] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [eventFocus, setEventFocus] = useState<EonetEvent | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("SLOPE CRACK");
  const [reportSeverity, setReportSeverity] = useState("MEDIUM");
  const [reportDescription, setReportDescription] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const [reportLocation, setReportLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [networkState, setNetworkState] = useState<"ONLINE" | "LIMITED NETWORK" | "OFFLINE MODE">("ONLINE");
  const [language, setLanguage] = useState<NotificationLanguage>(() => getStoredNotificationLanguage());
  const [notificationKind, setNotificationKind] = useState<NotificationKind>("CRITICAL_WARNING");
  const [deviceHealthOpen, setDeviceHealthOpen] = useState(false);
  const [quarantineOpen, setQuarantineOpen] = useState(false);
  const [operatorApprovalModal, setOperatorApprovalModal] = useState(false);
  const [operatorDeliveryLogs, setOperatorDeliveryLogs] = useState<{ channel: string; status: string; timestamp: string; messagePreview: string }[] | null>(null);

  // Sensor Anomaly and Validation State
  const [anomalyOverride, setAnomalyOverride] = useState<"NONE" | "TILT_SPIKE" | "WEATHER_API_DELAY" | "LOW_BATT">("NONE");
  const [quarantineList, setQuarantineList] = useState(() => getStoredQuarantine());
  const timer = useRef<number | undefined>(undefined);

  const liveQuery = trpc.landslides.list.useQuery(undefined, { staleTime: 300000, retry: 1 });
  const platformQuery = trpc.platform.capabilities.useQuery(undefined, { staleTime: 300000 });
  const deviceHealthQuery = trpc.iot.deviceHealth.useQuery({ nodeId: selected }, { staleTime: 10000 });
  const operatorApprovalMutation = trpc.alerts.operatorApproval.useMutation();

  const liveEvents: EonetEvent[] = liveQuery.data?.events ?? [];
  const liveAvailable = Boolean(liveQuery.data?.available);
  const displayedEvents = demoMode ? [] : liveEvents;
  const recentEvents = liveEvents.filter((event) => eventAgeDays(event.date) <= 30);
  const zone = zones.find((z) => z.id === selected) || zones[1];
  const analysisPoint = selectedPoint ?? { latitude: Number(zone.coords.split(",")[0]), longitude: Number(zone.coords.split(",")[1]) };
  const nearestEvent = useMemo(() => (demoMode ? [] : liveEvents).reduce<{ event: EonetEvent | null; distance: number }>((best, event) => {
    const distance = distanceKm(analysisPoint, event);
    return !best.event || distance < best.distance ? { event, distance } : best;
  }, { event: null, distance: Infinity }), [liveEvents, analysisPoint.latitude, analysisPoint.longitude, demoMode]);

  // Live Deterministic Validation Layer
  const currentTelemetryInput = useMemo(() => {
    const isTiltSpike = anomalyOverride === "TILT_SPIKE";
    return {
      deviceId: `landsora-esp32-${zone.id.toLowerCase()}`,
      siteId: zone.id,
      capturedAtUtc: new Date().toISOString(),
      rainfallMmInterval: zone.rainfall,
      soilMoisturePercent: zone.soil,
      tiltDegrees: isTiltSpike ? 0.385 : zone.tilt, // Injected spike if SCN-4 active
      temperatureC: 22.8,
      humidityPercent: 81.0,
      pressureHpa: 1011.4,
      batteryVoltage: anomalyOverride === "LOW_BATT" ? 3.12 : zone.batteryVoltage,
      wifiRssiDbm: anomalyOverride === "LOW_BATT" ? -88 : zone.wifiRssi,
      sourceMode: "LIVE" as const,
      externalWeatherRainfallMm: anomalyOverride === "WEATHER_API_DELAY" ? 2.0 : zone.rainfall + 1.2,
    };
  }, [zone, anomalyOverride]);

  const validationResult = useMemo(() => {
    return runLiveValidation(currentTelemetryInput, [
      {
        deviceId: `landsora-esp32-${zone.id.toLowerCase()}`,
        siteId: zone.id,
        capturedAtUtc: new Date(Date.now() - 2500).toISOString(),
        rainfallMmInterval: zone.rainfall - 0.2,
        soilMoisturePercent: zone.soil - 0.5,
        tiltDegrees: zone.tilt,
      }
    ]);
  }, [currentTelemetryInput, zone]);

  // Clean, deduplicated quarantine recording effect
  const lastQuarantineReadingId = useRef<string | null>(null);
  useEffect(() => {
    if (validationResult.isQuarantined && anomalyOverride === "TILT_SPIKE") {
      if (lastQuarantineReadingId.current !== validationResult.readingId) {
        lastQuarantineReadingId.current = validationResult.readingId;
        const record = {
          id: `QR-${Date.now()}`,
          readingId: validationResult.readingId,
          deviceId: validationResult.deviceId,
          siteId: validationResult.siteId,
          timestamp: clock(),
          anomalyTypes: validationResult.anomaliesDetected,
          rawValues: { tiltDegrees: 0.385, rainfallMm: zone.rainfall, soilMoisture: zone.soil },
          reason: "Unrealistic sudden tilt jump (>0.08°/sample) isolated by Stage 4 Behavioral Check.",
          reviewed: false,
        };
        saveQuarantineRecord(record);
        setQuarantineList(getStoredQuarantine());
      }
    }
  }, [validationResult, anomalyOverride, zone]);

  // If quarantined, the validated readings protect the risk engine from falsely jumping
  const effectiveTilt = validationResult.validatedTelemetry.tiltDegrees;
  const effectiveRain = validationResult.validatedTelemetry.rainfallMm;
  const effectiveSoil = validationResult.validatedTelemetry.soilMoisturePercent;

  const riskInputs = useMemo(() => ({
    rainfallScore: Math.min(100, (effectiveRain / 32) * 100),
    terrainScore: Math.min(100, (effectiveTilt / 0.16) * 100),
    historicalLandslideScore: zone.baseline,
    recentEventScore: demoMode ? zone.history.slice(-3).reduce((sum, value) => sum + value, 0) / 3 : recentEvents.length ? Math.min(100, recentEvents.length * 12) : 0
  }), [effectiveRain, effectiveTilt, zone.baseline, zone.history, demoMode, recentEvents.length]);

  const riskQuery = trpc.risk.score.useQuery(riskInputs, { staleTime: 2000 });
  const aiAnalysisMutation = trpc.risk.aiAnalysis.useMutation();
  const assistantMutation = trpc.risk.assistant.useMutation();
  const [assistantQuery, setAssistantQuery] = useState("");
  const [lastAnalyzedLevel, setLastAnalyzedLevel] = useState<string | null>(null);
  const isRefreshingAi = useRef(false);

  const prototypeRiskScore = riskQuery.data?.score ?? zone.score;
  const prototypeRiskLevel = riskQuery.data?.level ?? zone.tier;
  const prototypeRiskColor = prototypeRiskLevel === "CRITICAL" ? "#C24B3F" : prototypeRiskLevel === "HIGH" ? "#D6A24E" : prototypeRiskLevel === "MODERATE" ? "#C28A70" : "#6FA377";
  const prototypeTier: Tier = prototypeRiskLevel === "CRITICAL" || prototypeRiskLevel === "HIGH" ? "CRITICAL" : prototypeRiskLevel === "MODERATE" ? "WATCH" : "STABLE";
  const dataView = getDataPresentation({ demoMode, available: liveAvailable, queryError: Boolean(liveQuery.error), eventCount: liveEvents.length });
  const exposure = prototypeRiskScore >= 76 ? 2400 : prototypeRiskScore >= 51 ? 1100 : 420;
  const roadStatus = (threshold: number): RoadStatus => prototypeRiskScore >= threshold ? (prototypeRiskScore >= 86 ? "BLOCKED" : "AT RISK") : prototypeRiskScore >= 45 ? "RESTRICTED" : "OPEN";
  const roadRows = [
    { name: "NH 10 / Teesta Corridor", status: roadStatus(58), distance: "1.2 km", villages: 3, confidence: prototypeRiskScore >= 76 ? "MEDIUM" : "LOW" },
    { name: "Kodagu Valley Link", status: roadStatus(48), distance: "0.8 km", villages: 2, confidence: prototypeRiskScore >= 51 ? "MEDIUM" : "LOW" },
    { name: "Wayanad Village Road", status: roadStatus(68), distance: "2.4 km", villages: 1, confidence: "LOW" }
  ];
  const forecast = [
    { time: "NOW", weather: zone.rainfall > 18 ? "HEAVY RAIN" : "LIGHT RAIN", score: prototypeRiskScore },
    { time: "+6 HOURS", weather: zone.rainfall > 15 ? "VERY HEAVY RAIN" : "MODERATE RAIN", score: Math.min(100, prototypeRiskScore + 9) },
    { time: "+12 HOURS", weather: "MODERATE RAIN", score: Math.min(100, prototypeRiskScore + 4) },
    { time: "+24 HOURS", weather: "LIGHT RAIN", score: Math.max(0, prototypeRiskScore - 7) },
    { time: "+48 HOURS", weather: "CLEARING", score: Math.max(0, prototypeRiskScore - 11) }
  ];
  const responsePriority = prototypeRiskScore >= 76 ? "PRIORITY 1" : prototypeRiskScore >= 51 ? "PRIORITY 2" : "PRIORITY 3";
  const notification = renderNotification(notificationKind, language, { place: zone.name, road: roadRows[0].name });

  // Stable AI Decision Intelligence Object (prevents collapsing, height jumps, and flickering)
  const displayAnalysis = useMemo(() => {
    if (aiAnalysisMutation.data) {
      return aiAnalysisMutation.data;
    }
    const isCritical = prototypeRiskLevel === "CRITICAL" || prototypeRiskLevel === "HIGH";
    const isWatch = prototypeRiskLevel === "MODERATE";

    return {
      provider: "BUILT_IN_SERVER_LLM" as const,
      model: "claude-haiku-4-5" as const,
      status: "READY" as const,
      riskLevel: prototypeRiskLevel as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      assessment: isCritical
        ? `${zone.name} is exhibiting elevated slope instability (${prototypeRiskScore}/100). Rapid saturation and tilt acceleration detected by field telemetry.`
        : isWatch
        ? `${zone.name} is in an active watch state (${prototypeRiskScore}/100). Rainfall accumulation requires close geotechnical monitoring.`
        : `${zone.name} displays stable baseline conditions (${prototypeRiskScore}/100). All telemetry channels remain within normal safety bounds.`,
      why: isCritical
        ? `Soil moisture saturation (${effectiveSoil.toFixed(1)}%) combined with current rainfall (${effectiveRain.toFixed(1)} mm/hr) and tilt velocity (${effectiveTilt.toFixed(3)} °/hr) surpasses local safety thresholds.`
        : isWatch
        ? `Cumulative precipitation is elevating slope pore-water pressure near ${zone.name}. Physical tilt sensors remain within initial warning parameters.`
        : `Physical slope inclinometers and soil capacitive probes indicate safe pore pressure and minimal displacement near ${zone.name}.`,
      factors: [
        `Rainfall intensity: ${effectiveRain.toFixed(1)} mm/hr (Tipping bucket rain gauge)`,
        `Soil saturation: ${effectiveSoil.toFixed(1)}% (Capacitive sensor array)`,
        `Slope tilt rate: ${effectiveTilt.toFixed(3)} °/hr (MPU6050 dual-axis inclinometer)`,
        `Data validation: ${validationResult.status} (${validationResult.overallConfidence}% confidence score)`
      ],
      actions: isCritical
        ? [
            "Issue priority advisories to local village panchayats and police checkposts.",
            "Verify alternative evacuation corridors for NH 10 and regional passes.",
            "Maintain continuous 2.5s IoT telemetry streaming."
          ]
        : isWatch
        ? [
            "Increase inspection frequency for drainage culverts and road embankments.",
            "Alert district emergency response teams to standby status.",
            "Ensure emergency sirens and VHF backup repeaters are operational."
          ]
        : [
            "Maintain routine automated telemetry logging and battery health polling.",
            "Verify citizen hazard reports periodically.",
            "No immediate evacuation required."
          ],
      warning: "Landsora AI provides decision-support interpretation of validated field telemetry. In emergency operations, follow official directives from SDMA and local police authorities.",
      confidence: validationResult.overallConfidence > 80 ? "HIGH" as const : "MEDIUM" as const,
      generatedAt: new Date().toISOString()
    };
  }, [aiAnalysisMutation.data, prototypeRiskLevel, prototypeRiskScore, zone.name, effectiveRain, effectiveSoil, effectiveTilt, validationResult]);

  // 7-Scenario Presets
  const setDemoScenario = (name: string) => {
    setScenario(name);
    setStorm(false);
    setStormProgress(0);
    setAnomalyOverride("NONE");

    if (name === "NORMAL CONDITIONS") {
      setZones(initialZones);
      setNotice("Scenario 1 Loaded: Normal baseline conditions · 98% Confidence.");
    } else if (name === "PERSISTENT HEAVY RAIN") {
      setZones(prev => prev.map(z => z.id === selected ? { ...z, rainfall: 22.4, soil: 82.5, score: 58, tier: "WATCH" } : z));
      setNotice("Scenario 2 Loaded: Persistent rainfall elevating soil saturation (WATCH tier).");
    } else if (name === "EXTREME STORM & TILT") {
      setZones(prev => prev.map(z => z.id === selected ? { ...z, rainfall: 31.8, soil: 92.4, tilt: 0.128, score: 84, tier: "CRITICAL" } : z));
      setStorm(true);
      setNotice("Scenario 3 Loaded: Multi-signal extreme storm escalation (CRITICAL tier).");
    } else if (name === "BAD SENSOR DATA (TILT SPIKE)") {
      setAnomalyOverride("TILT_SPIKE");
      setNotice("Scenario 4 Loaded: Injected 0.385° tilt jump quarantined by validation layer! Risk score protected.");
    } else if (name === "WEATHER API DELAYED") {
      setAnomalyOverride("WEATHER_API_DELAY");
      setNotice("Scenario 5 Loaded: Weather API delayed; confidence dropped to 72% with data staleness flags.");
    } else if (name === "LOW BATTERY & DEGRADED") {
      setAnomalyOverride("LOW_BATT");
      setNotice("Scenario 6 Loaded: ESP32 battery voltage dropped to 3.12V (Hardware warning).");
    } else if (name === "CRITICAL ESCALATION (OPERATOR APPROVAL)") {
      setZones(prev => prev.map(z => z.id === selected ? { ...z, rainfall: 33.2, soil: 94.0, tilt: 0.135, score: 88, tier: "CRITICAL" } : z));
      setOperatorApprovalModal(true);
      setNotice("Scenario 7 Loaded: Critical state requires Operator Authorization before mock dispatch.");
    }
  };

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setZones(prev => prev.map(z => {
        const oldTier = z.tier;
        const stormBoost = storm ? stormProgress / 100 : 0;
        const intensity = scenario.includes("HEAVY") || scenario.includes("EXTREME") ? 1.6 : 1;
        const rain = Math.max(2, Math.min(34, z.rainfall + (Math.random() - .46) * intensity + stormBoost * 1.25));
        const soil = Math.max(25, Math.min(94, z.soil + (rain > z.rainfall ? .16 : -.08) * intensity + (Math.random() - .52) * .45 + stormBoost * .28));
        const tilt = Math.max(.025, Math.min(.145, z.tilt + (Math.random() - .47) * .002 * intensity + stormBoost * .0009));
        const next = { ...z, rainfall: Number(rain.toFixed(1)), soil: Number(soil.toFixed(1)), tilt: Number(tilt.toFixed(3)) };
        const score = calcScore(next);
        const tier = classify(score);
        if (tier !== oldTier) {
          setEvents(es => [{ time: clock(), zone: z.name, transition: `${oldTier} → ${tier}`, risk: score }, ...es].slice(0, 6));
        }
        return { ...next, score, tier, history: [...z.history.slice(-15), score] };
      }));
      setLastUpdate(clock());
    }, 2500);
    return () => window.clearInterval(timer.current);
  }, [scenario, storm, stormProgress]);

  useEffect(() => {
    if (storm && stormProgress < 100) {
      const t = window.setTimeout(() => setStormProgress(p => Math.min(100, p + 6)), 1000);
      return () => window.clearTimeout(t);
    }
  }, [storm, stormProgress]);

  const handleOperatorApproval = () => {
    operatorApprovalMutation.mutate({
      zoneId: zone.id,
      riskScore: prototypeRiskScore,
      riskLevel: prototypeRiskLevel,
      operatorName: "Officer S. Ramesh (DDMA Commander)",
      language,
      channels: ["SMS_PANCHAYAT", "BROWSER_PUSH", "POLICE_DESK"],
    }, {
      onSuccess: (data) => {
        setOperatorDeliveryLogs(data.deliveryLogs);
        setAck(true);
        setNotice(`Alert Dispatch ${data.dispatchId} verified & logged for 24 village panchayats.`);
      }
    });
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedPoint({
      latitude: Number((8 + (1 - (event.clientY - rect.top) / rect.height) * 28).toFixed(4)),
      longitude: Number((68 + ((event.clientX - rect.left) / rect.width) * 28).toFixed(4))
    });
    setEventFocus(null);
  };

  const requestReportLocation = () => {
    if (!navigator.geolocation) {
      setNotice("Location permission is unavailable in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      setReportLocation({ latitude: Number(position.coords.latitude.toFixed(4)), longitude: Number(position.coords.longitude.toFixed(4)) });
      setNotice("GPS location attached to local citizen report.");
    }, () => setNotice("Location permission not granted; select a map point instead."));
  };

  const submitReport = () => {
    const reportId = `LANDSORA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const queued = createQueuedReport({ reportId, category: reportCategory, severity: reportSeverity, description: reportDescription, location: reportLocation ?? analysisPoint, attachment: reportFile?.name ?? null });
    saveQueuedReport(queued);
    setReportSaved(true);
    setReportOpen(false);
    setNotice(`${reportId} queued for human verification.`);
    setReportDescription("");
    setReportFile(null);
  };

  const cycleNetwork = () => {
    const next = networkState === "ONLINE" ? "LIMITED NETWORK" : networkState === "LIMITED NETWORK" ? "OFFLINE MODE" : "ONLINE";
    setNetworkState(next);
    setNotice(`Network state changed to ${next}. Local offline queue active.`);
  };

  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);

  // Auto-switch language based on focused zone region if autoDetect is active
  useEffect(() => {
    if (autoDetectLanguage) {
      const autoLang = detectLanguageForZone(selected);
      if (autoLang !== language) {
        setLanguage(autoLang);
        saveNotificationLanguage(autoLang);
        const meta = notificationLanguages.find(l => l.code === autoLang);
        setNotice(`📍 Region Detected: ${zone.name} (${zone.region}). Automatically switched language to ${meta?.label} (${meta?.nativeLabel}).`);
      }
    }
  }, [selected, autoDetectLanguage]);

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      setNotice("GPS Geolocation is not supported by this browser.");
      return;
    }
    setNotice("Detecting your GPS location and nearest monitoring node...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let closestZone = zones[0];
        let minDistance = Infinity;
        zones.forEach((z) => {
          const [zLat, zLon] = z.coords.split(",").map(Number);
          const dist = distanceKm({ latitude: lat, longitude: lon }, { latitude: zLat, longitude: zLon });
          if (dist < minDistance) {
            minDistance = dist;
            closestZone = z;
          }
        });
        setSelected(closestZone.id);
        const detectedLang = detectLanguageFromCoords(lat, lon);
        setLanguage(detectedLang);
        saveNotificationLanguage(detectedLang);
        const langMeta = notificationLanguages.find((l) => l.code === detectedLang);
        setNotice(
          `📍 GPS Location Detected (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E) — Nearest Node: ${closestZone.name} (${minDistance.toFixed(0)} km). Auto-switched language to ${langMeta?.label} (${langMeta?.nativeLabel}).`
        );
      },
      () => {
        const fallbackLang = detectLanguageForZone(selected);
        setLanguage(fallbackLang);
        setNotice(`GPS access unavailable. Focused on ${zone.name}'s regional language (${fallbackLang}).`);
      }
    );
  };

  const changeLanguage = (next: string) => {
    const selectedLanguage = notificationLanguages.find(item => item.code === next);
    if (!selectedLanguage) return;
    setLanguage(selectedLanguage.code);
    saveNotificationLanguage(selectedLanguage.code);
    setNotice(`Language switched to ${selectedLanguage.label} (${selectedLanguage.nativeLabel}).`);
  };

  const runAiAnalysis = () => {
    aiAnalysisMutation.mutate({
      location: zone.name,
      rainfall: zone.rainfall,
      weather: forecast[0].weather,
      soil: zone.soil,
      tilt: zone.tilt,
      recentEventsNearby: nearestEvent.distance <= 50,
      recentEventCount: recentEvents.length,
      historicalContext: `Prototype baseline ${zone.baseline}/100; source context is ${liveAvailable ? "NASA EONET feed available" : "real-time source unavailable"}.`,
      calculatedRiskScore: prototypeRiskScore,
      calculatedRiskLevel: prototypeRiskLevel as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      language,
      dataAvailable: liveAvailable && !demoMode
    });
    setLastAnalyzedLevel(prototypeRiskLevel);
  };

  const askAssistant = (customQuery?: string) => {
    const queryToUse = customQuery || assistantQuery;
    if (!queryToUse.trim()) return;
    assistantMutation.mutate({
      question: queryToUse,
      language,
      location: zone.name,
      rainfall: zone.rainfall,
      weather: forecast[0].weather,
      soil: zone.soil,
      tilt: zone.tilt,
      recentEventCount: recentEvents.length,
      calculatedRiskScore: prototypeRiskScore,
      calculatedRiskLevel: prototypeRiskLevel as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      dataAvailable: liveAvailable && !demoMode
    });
  };

  useEffect(() => {
    if (shouldRefreshAiAnalysis({ previousLevel: lastAnalyzedLevel, currentLevel: prototypeRiskLevel, liveAvailable, demoMode })) {
      if (!isRefreshingAi.current && !aiAnalysisMutation.isPending) {
        isRefreshingAi.current = true;
        runAiAnalysis();
        const t = window.setTimeout(() => {
          isRefreshingAi.current = false;
        }, 4000);
        return () => window.clearTimeout(t);
      }
    }
  }, [prototypeRiskLevel, liveAvailable, demoMode, lastAnalyzedLevel]);

  // Export CSV Telemetry
  const exportTelemetryCsv = () => {
    const headers = "Timestamp,Zone,Rainfall_mm_hr,Soil_Moisture_Pct,Tilt_Rate_deg_hr,Risk_Score,Confidence_Pct\n";
    const rows = zone.history.map((score, i) => {
      const timeStr = `${lastUpdate.slice(0, 5)}:${String(Math.max(0, 40 - i * 2)).padStart(2, "0")}`;
      return `${timeStr},${zone.name},${(zone.rainfall - i * 0.4).toFixed(1)},${(zone.soil - i * 0.8).toFixed(1)},${(zone.tilt - i * 0.001).toFixed(3)},${score},${validationResult.overallConfidence}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Landsora_Telemetry_${zone.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice("Telemetry CSV exported successfully.");
  };

  // Export NDMA Incident Dossier
  const exportIncidentDossier = () => {
    const dossierText = `# LANDSORA INCIDENT COMMAND DOSSIER (NDMA / SDMA COMPLIANT)
Generated: ${new Date().toISOString()}
Location Node: ${zone.name} (${zone.id}) — ${zone.region} [${zone.coords}]
Operational Authority: District Disaster Management Authority

--------------------------------------------------------------------------------
1. EXECUTIVE RISK STATUS
- Deterministic Risk Score: ${prototypeRiskScore} / 100 [${prototypeRiskLevel}]
- Data Confidence Score: ${validationResult.overallConfidence}% (${validationResult.status})
- Active Response Priority: ${responsePriority}
- Estimated Population Exposure: ${exposure.toLocaleString()} residents
- Affected Road Corridors: ${roadRows.filter(r => r.status !== "OPEN").map(r => `${r.name} (${r.status})`).join(", ") || "None"}

--------------------------------------------------------------------------------
2. IOT SENSOR TELEMETRY & VALIDATION
- Rainfall Intensity: ${zone.rainfall} mm/hr (Tipping Bucket)
- Soil Moisture Saturation: ${zone.soil}% (Capacitive Probe)
- Slope Tilt Rate: ${zone.tilt} °/hr (MPU6050 Inclinometer)
- Validation Status: ${validationResult.status} (Quarantined: ${validationResult.isQuarantined ? "YES" : "NO"})
- Battery / Device Health: ${zone.batteryVoltage}V / RSSI ${zone.wifiRssi} dBm
--------------------------------------------------------------------------------
3. AI RISK EXPLANATION & DIRECTIVES
${aiAnalysisMutation.data?.assessment ?? "Assessment pending live generation."}

Official Disclaimer: Landsora is an IoT decision-support prototype. Directives must be coordinated with local police and SDMA emergency protocols.
`;

    const blob = new Blob([dossierText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Landsora_NDMA_Dossier_${zone.id}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice("Official Incident Dossier (.md) generated and downloaded.");
  };

  return (
    <div className="app-shell dashboard-app-shell">
      {/* Top Application Header */}
      <header className="dashboard-app-header">
        <div className="dash-header-left">
          <Link href="/" className="dash-back-btn" title="Back to overview">
            <ArrowLeft size={14} />
            <span>OVERVIEW</span>
          </Link>
          <div className="dash-header-brand">
            <div className="logo-wrap"><img src={assetUrl("lews-logo.png")} alt="Landsora logo" /></div>
            <div>
              <div className="brand-name">LANDSORA CONSOLE</div>
              <div className="brand-sub">IOT LANDSLIDE EARLY WARNING · {zone.name.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="dash-header-controls">
          {/* 1-Click Language Switcher Pill Strip */}
          <div className="header-lang-strip" aria-label="1-Click language selector">
            <button
              className={`lang-pill-btn auto-pill ${autoDetectLanguage ? "active" : ""}`}
              onClick={() => {
                const next = !autoDetectLanguage;
                setAutoDetectLanguage(next);
                if (next) {
                  const autoLang = detectLanguageForZone(selected);
                  setLanguage(autoLang);
                  setNotice(`📍 Auto-region detection active: set to ${autoLang}.`);
                } else {
                  setNotice("Auto-detection paused. Manual language lock active.");
                }
              }}
              title="Automatically detect regional language by focused zone"
            >
              <Compass size={12} /> <span>AUTO</span>
            </button>

            <button
              className="lang-pill-btn gps-pill"
              onClick={handleDetectGpsLocation}
              title="Detect my device GPS location and switch language"
            >
              <MapPin size={12} /> <span>GPS</span>
            </button>

            <span className="lang-strip-separator" />

            {notificationLanguages.map((l) => (
              <button
                key={l.code}
                className={`lang-pill-btn ${language === l.code && !autoDetectLanguage ? "active manual-active" : language === l.code ? "active" : ""}`}
                onClick={() => {
                  setAutoDetectLanguage(false);
                  changeLanguage(l.code);
                }}
                title={`Switch to ${l.label} (${l.nativeLabel})`}
              >
                <span className="lang-code">{l.code}</span>
                <span className="lang-native">{l.nativeLabel}</span>
              </button>
            ))}
          </div>

          <button className={`demo-toggle ${demoMode ? "is-on" : ""}`} onClick={() => setDemoMode(v => !v)} aria-pressed={demoMode}>
            <span /> DEMO
          </button>

          <button className="dash-network-btn" onClick={cycleNetwork}>
            {networkState === "ONLINE" ? <Wifi size={13} /> : <WifiOff size={13} />} {networkState}
          </button>

          {/* User Account Session Indicator */}
          {user ? (
            <div className="dash-user-badge" title={`Signed in as ${user.name || user.email} (${user.role})`}>
              <Shield size={12} className="text-amber-400" />
              <span>{user.name || user.email?.split("@")[0] || "OPERATOR"}</span>
            </div>
          ) : (
            <Link href="/login" className="dash-auth-link" title="Operator Sign In">
              <span>SIGN IN</span>
            </Link>
          )}

          <Link href="/settings" className="dash-settings-link" title="Console Settings">
            <SettingsIcon size={14} />
          </Link>
        </div>
      </header>

      {/* Main Operational Container */}
      <main className="dashboard-main-area">
        {/* Data Status & Confidence Bar */}
        <div className="data-status-bar landsora-status-bar">
          <div className="status-bar-left">
            <span className="data-status-label">{dataView.tone.toUpperCase()}</span>
            <strong>{dataView.source}</strong>
            <span className="confidence-pill" style={{ borderColor: validationResult.overallConfidence > 80 ? "#6FA377" : validationResult.overallConfidence > 50 ? "#D6A24E" : "#C24B3F" }}>
              <CheckCircle2 size={12} /> CONFIDENCE: <b>{validationResult.overallConfidence}%</b> ({validationResult.status})
            </span>
          </div>

          <div className="status-bar-right">
            <button className="quick-tool-btn" onClick={() => setDeviceHealthOpen(true)}>
              <Cpu size={12} /> ESP32 HEALTH
            </button>
            <button className="quick-tool-btn" onClick={() => setQuarantineOpen(true)}>
              <AlertOctagon size={12} /> QUARANTINE ({getStoredQuarantine().length})
            </button>
            <button className="quick-tool-btn" onClick={exportTelemetryCsv}>
              <FileSpreadsheet size={12} /> EXPORT CSV
            </button>
            <button className="quick-tool-btn highlight-btn" onClick={exportIncidentDossier}>
              <FileText size={12} /> NDMA DOSSIER
            </button>
          </div>
        </div>

        {/* 7-Scenario Simulation Ribbon */}
        <div className="scenario-ribbon panel">
          <div className="scenario-ribbon-head">
            <span><Sliders size={13} /> 7-SCENARIO SIMULATION SANDBOX</span>
            <small className="mono">ACTIVE: {scenario}</small>
          </div>
          <div className="scenario-btn-group">
            <button className={scenario === "NORMAL CONDITIONS" ? "active" : ""} onClick={() => setDemoScenario("NORMAL CONDITIONS")}>
              01 NORMAL
            </button>
            <button className={scenario === "PERSISTENT HEAVY RAIN" ? "active" : ""} onClick={() => setDemoScenario("PERSISTENT HEAVY RAIN")}>
              02 PERSISTENT RAIN
            </button>
            <button className={scenario === "EXTREME STORM & TILT" ? "active" : ""} onClick={() => setDemoScenario("EXTREME STORM & TILT")}>
              03 EXTREME STORM
            </button>
            <button className={scenario === "BAD SENSOR DATA (TILT SPIKE)" ? "active" : ""} onClick={() => setDemoScenario("BAD SENSOR DATA (TILT SPIKE)")}>
              04 TILT SPIKE QUARANTINE
            </button>
            <button className={scenario === "WEATHER API DELAYED" ? "active" : ""} onClick={() => setDemoScenario("WEATHER API DELAYED")}>
              05 WEATHER API DELAY
            </button>
            <button className={scenario === "LOW BATTERY & DEGRADED" ? "active" : ""} onClick={() => setDemoScenario("LOW BATTERY & DEGRADED")}>
              06 LOW BATTERY
            </button>
            <button className={scenario === "CRITICAL ESCALATION (OPERATOR APPROVAL)" ? "active" : ""} onClick={() => setDemoScenario("CRITICAL ESCALATION (OPERATOR APPROVAL)")}>
              07 OPERATOR APPROVAL
            </button>
          </div>
        </div>

        {/* Primary 3-Column Operational Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Zone Monitor List */}
          <aside className="zone-monitor panel">
            <div className="panel-title">
              <span>ZONE MONITOR / SIMULATED SENSOR STATE</span>
              <span className="mono">06 / 06</span>
            </div>
            <div className="zone-list">
              {zones.map(z => (
                <button
                  key={z.id}
                  className={`zone-row ${z.id === selected ? "selected" : ""}`}
                  onClick={() => setSelected(z.id)}
                >
                  <div className="zone-info">
                    <div className="zone-top">
                      <span className="status-dot" style={{ background: statusColor(z.tier) }} />
                      <strong>{z.name}</strong>
                      <span className="zone-arrow">{z.score >= z.history[z.history.length - 2] ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}</span>
                    </div>
                    <div className="zone-bottom">
                      <div className="zone-signal">
                        <b style={{ color: statusColor(z.tier) }}>SENSOR {z.tier}</b>
                        <span className="score">SIGNAL <b>{z.score}</b> <small>/ 100</small></span>
                      </div>
                      <span className="zone-region">{z.region.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="zone-spark-col">
                    <TinySpark values={z.history} color={statusColor(z.tier)} />
                    <span>RISK TRACE</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="network">
              <div className="panel-title">SENSOR NETWORK <span className="online-mini"><i /> NOMINAL</span></div>
              <div className="network-big">12 / 12 <span>CHANNELS ONLINE</span></div>
              <div className="network-row"><span>DATA LINK</span><b>{demoMode ? "SIMULATED" : liveAvailable ? "NASA EONET" : "FALLBACK"}</b></div>
              <div className="network-row"><span>MQTT LATENCY</span><b>1.8 SEC</b></div>
              <div className="network-row"><span>NODE BATTERY</span><b>{zone.batteryVoltage}V ({Math.round(((zone.batteryVoltage - 3.2) / 1.0) * 100)}%)</b></div>
            </div>
          </aside>

          {/* Center Column: Terrain GIS Map */}
          <div id="map-panel" className="map-panel panel">
            <div className="map-head">
              <div>
                <span className="panel-kicker">LIVE MAP / TERRAIN LAYER</span>
                <h3>Monitored slope nodes & NASA feeds</h3>
              </div>
              <div className="map-head-actions">
                <span className="map-mode"><Layers3 size={14} /> {dataView.label}</span>
              </div>
            </div>
            <div className="map-canvas" onClick={handleMapClick}>
              <img src={assetUrl("lews-contour-texture.png")} alt="Topographic contour texture" />
              <div className="map-grid" />
              <svg className="map-contour-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-5 32 C 12 14, 26 54, 42 31 S 74 8, 105 26" />
                <path d="M-10 44 C 9 29, 21 65, 43 43 S 77 21, 110 38" />
                <path d="M-8 58 C 13 40, 26 79, 51 57 S 80 34, 108 52" />
                <path d="M-6 72 C 16 54, 33 91, 57 70 S 84 51, 109 66" />
                <path d="M-3 85 C 20 69, 37 103, 64 83 S 88 67, 108 80" />
              </svg>
              <div className="map-data-ribbon">
                <span>FIELD TILE / 13N—75E</span>
                <span>GRID / 20M</span>
                <span>LIVE NODES / 06</span>
              </div>
              <div className="map-coord map-coord-n">13° 18′ N</div>
              <div className="map-coord map-coord-e">75° 48′ E</div>
              <div className="map-label label-west">WESTERN GHATS</div>
              <div className="map-label label-east">EASTERN HIMALAYAS</div>

              {zones.map((z, i) => {
                const positions = [[28, 51], [34, 62], [23, 43], [31, 74], [46, 57], [75, 31]][i];
                return (
                  <button
                    key={z.id}
                    className={`marker ${z.id === selected ? "active" : ""}`}
                    style={{ left: `${positions[0]}%`, top: `${positions[1]}%`, color: statusColor(z.tier) }}
                    onClick={(event) => { event.stopPropagation(); setSelected(z.id); setSelectedPoint(null); }}
                  >
                    <span className="marker-pulse" />
                    <span className="marker-core" />
                    <label>{z.name.toUpperCase()}</label>
                  </button>
                );
              })}

              {displayedEvents.slice(0, 24).map((event, index) => {
                const [left, top] = eventPosition(event, index);
                return (
                  <button
                    key={event.id}
                    className={`eonet-marker ${eventTone(event.date)}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    onClick={(clickEvent) => { clickEvent.stopPropagation(); setEventFocus(event); }}
                    aria-label={`NASA EONET event ${event.title}`}
                  >
                    <span />
                    <b>{eventTone(event.date) === "very-recent" ? "NEW" : "NASA"}</b>
                  </button>
                );
              })}

              {eventFocus && (
                <div className="eonet-popover">
                  <button className="popover-close" onClick={() => setEventFocus(null)} aria-label="Close event details">
                    <X size={13} />
                  </button>
                  <span className="panel-kicker">NASA EONET / REPORTED EVENT</span>
                  <strong>{eventFocus.title}</strong>
                  <small>{new Date(eventFocus.date).toLocaleString("en-GB")}</small>
                  <small>{eventFocus.latitude.toFixed(3)}° N · {eventFocus.longitude.toFixed(3)}° E</small>
                  <small>STATUS: {eventFocus.status.toUpperCase()} · SOURCE: {eventFocus.source}</small>
                </div>
              )}

              <div className="map-click-hint">CLICK MAP TO ANALYZE LOCATION</div>
              {!demoMode && liveAvailable && displayedEvents.length === 0 && (
                <div className="map-empty"><AlertTriangle size={14} /> NO CURRENT NASA EONET LANDSLIDE EVENTS IN FEED</div>
              )}
              {selectedPoint && (
                <div className="selected-point" style={{ left: `${Math.max(4, Math.min(96, ((selectedPoint.longitude - 68) / 28) * 100))}%`, top: `${Math.max(4, Math.min(96, (1 - (selectedPoint.latitude - 8) / 28) * 100))}%` }}>
                  <span /><b>ANALYSIS POINT</b>
                </div>
              )}
              <div className="map-scale"><span>0</span><i /><span>100 km</span></div>
              <div className="map-legend">
                <span><i style={{ background: "#6FA377" }} /> STABLE</span>
                <span><i style={{ background: "#D6A24E" }} /> WATCH</span>
                <span><i style={{ background: "#C24B3F" }} /> CRITICAL</span>
                <span className="eonet-legend"><i /> NASA EONET EVENTS</span>
              </div>
            </div>
            <div className="map-foot">
              <span><Crosshair size={14} /> FOCUSED NODE: <b>{zone.id}</b></span>
              <span>BASEMAP: TOPOGRAPHIC CONTOURS</span>
            </div>
          </div>

          {/* Right Column: Zone Intelligence & Gauges */}
          <aside className="intelligence panel">
            <div className="panel-title">
              <span>ZONE INTELLIGENCE</span>
              <span className="mono">{zone.id}</span>
            </div>
            <div className="selected-zone">
              <span>SELECTED NODE</span>
              <h3>{zone.name}</h3>
              <p>{zone.region} · {zone.coords}</p>
            </div>
            <div className="live-analysis">
              <div className="live-analysis-title">
                <span>LOCATION TELEMETRY STATUS</span>
                <strong>{validationResult.status}</strong>
              </div>
              <div className="analysis-grid">
                <span>LAT / LONG<b>{analysisPoint.latitude.toFixed(4)}, {analysisPoint.longitude.toFixed(4)}</b></span>
                <span>DATA CONFIDENCE<b style={{ color: validationResult.overallConfidence > 80 ? "#6FA377" : "#D6A24E" }}>{validationResult.overallConfidence}%</b></span>
                <span>NEAREST REPORTED EVENT<b>{nearestEvent.event ? `${nearestEvent.distance.toFixed(0)} km` : "—"}</b></span>
                <span>PROTOTYPE RISK SCORE<b style={{ color: prototypeRiskColor }}>{prototypeRiskScore} / 100</b></span>
              </div>
            </div>
            <div className="risk-block">
              <div className="risk-label">
                <span>LANDSORA RISK SCORE</span>
                <span style={{ color: prototypeRiskColor }}>{prototypeRiskLevel}</span>
              </div>
              <div className="gauge">
                <div className="gauge-track">
                  <div className="gauge-fill" style={{ width: `${prototypeRiskScore}%`, background: prototypeRiskColor }} />
                </div>
                <div className="gauge-number">{prototypeRiskScore}<small>/100</small></div>
              </div>
              <div className="advisory" style={{ borderColor: prototypeRiskColor }}>
                <span>ADVISORY / {prototypeRiskLevel}</span>
                <p>
                  {prototypeRiskLevel === "LOW"
                    ? "Slope conditions remain within seasonal stability margins."
                    : prototypeRiskLevel === "MODERATE"
                    ? "Moisture approaching plastic saturation limit. Maintain continuous monitoring."
                    : prototypeRiskLevel === "HIGH"
                    ? "Elevated pore pressure detected. Review mountain road corridors."
                    : "Critical slope failure risk. Authority assessment and response procedures should be initiated."}
                </p>
              </div>
            </div>
            <div className="metric-grid">
              <Metric icon={<CloudRain size={15} />} label="RAINFALL" value={zone.rainfall.toFixed(1)} unit="mm/hr" prev={zone.rainfall - 0.4} color="#84A6A0" />
              <Metric icon={<Waves size={15} />} label="SOIL MOISTURE" value={zone.soil.toFixed(1)} unit="%" prev={zone.soil - 0.6} color="#D6A24E" />
              <Metric icon={<Wind size={15} />} label="SLOPE TILT" value={zone.tilt.toFixed(3)} unit="°/hr" prev={zone.tilt - 0.002} color="#C28A70" />
            </div>
          </aside>
        </div>

        {/* Lower Telemetry & Explainability Grid */}
        <div className="lower-grid">
          <div className="chart-panel panel">
            <div className="panel-title">
              <span>RISK SCORE — LAST 16 READINGS</span>
              <span className="trend"><ArrowUpRight size={14} /> TREND {delta(prototypeRiskScore, zone.history[zone.history.length - 2])}</span>
            </div>
            <TrendChart values={zone.history} tier={prototypeTier} />
            <div className="chart-stats">
              <span>CURRENT <b>{prototypeRiskScore}</b></span>
              <span>PREVIOUS <b>{zone.history[zone.history.length - 2]}</b></span>
              <span>RECENT HIGH <b>{Math.max(...zone.history)}</b></span>
              <span>STATUS <b style={{ color: prototypeRiskColor }}>{prototypeRiskLevel}</b></span>
            </div>
          </div>

          <div className="explain panel">
            <div className="panel-title">
              <span>WHY THIS SCORE?</span>
              <span className="mono">DETERMINISTIC 4-FACTOR BREAKDOWN</span>
            </div>
            <p>Risk is <b style={{ color: prototypeRiskColor }}>{prototypeRiskLevel}</b> calculated via auditable formula without black-box AI:</p>
            <div className="contributions">
              {[
                ["RAINFALL INTENSITY", riskInputs.rainfallScore, "#84A6A0"],
                ["TERRAIN / TILT ACCELERATION", riskInputs.terrainScore, "#C28A70"],
                ["GEOLOGICAL BASELINE", riskInputs.historicalLandslideScore, "#D6A24E"],
                ["REGIONAL EVENT CONTEXT", riskInputs.recentEventScore, "#C24B3F"]
              ].map(([label, val, color]) => (
                <div className="contrib" key={label as string}>
                  <span>{label as string}<b>{Math.round((val as number) / 4)} / 100</b></span>
                  <i><em style={{ width: `${val as number}%`, background: color as string }} /></i>
                </div>
              ))}
            </div>
          </div>

          <div className="history panel">
            <div className="panel-title">
              <span>SENSOR HISTORY LOG</span>
              <span className="mono">LAST 5 READINGS</span>
            </div>
            <div className="history-head">
              <span>TIME</span><span>RAIN</span><span>MOISTURE</span><span>TILT</span>
            </div>
            {zone.history.slice(-5).reverse().map((v, i) => (
              <div className="history-row" key={`${v}-${i}`}>
                <span>{i === 0 ? lastUpdate : `${lastUpdate.slice(0, 5)}:${String(Math.max(0, 38 - i * 2)).padStart(2, "0")}`}</span>
                <span>{(zone.rainfall - (4 - i) * .7).toFixed(1)}</span>
                <span>{(zone.soil - (4 - i) * 1.1).toFixed(1)}%</span>
                <span>{(zone.tilt - (4 - i) * .002).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Support & Executive Operations Suite */}
        <section className="operations-addendum">
          <div className="section-coordinate">DECISION SUPPORT / 07</div>
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="rule" /> DECISION SUPPORT / 07</div>
              <h2>From sensor signals <em>to decisive action.</em></h2>
            </div>
            <p>Intelligence modules translate physical IoT telemetry into command protocols and public warnings.</p>
          </div>

          <div className="ops-grid">
            {/* AI Risk Intelligence */}
            <div className={`ai-risk-card panel ${aiAnalysisMutation.isPending ? "is-synthesizing" : ""}`}>
              <div className="panel-title">
                <span><Activity size={14} /> AI RISK INTELLIGENCE</span>
                <span className="mono">
                  {aiAnalysisMutation.isPending ? (
                    <span className="ai-pulse-chip"><span className="pulse-indicator" /> SYNTHESIZING TELEMETRY…</span>
                  ) : (
                    displayAnalysis.provider
                  )}
                </span>
              </div>
              <div className="ai-risk-head">
                <div>
                  <span className="ai-kicker">EXPLAINABLE AI INTERPRETATION / {notificationLanguages.find(item => item.code === language)?.nativeLabel}</span>
                  <h3>{displayAnalysis.assessment}</h3>
                </div>
                <button className="button primary" onClick={runAiAnalysis} disabled={aiAnalysisMutation.isPending}>
                  {aiAnalysisMutation.isPending ? "ANALYZING…" : "ANALYZE CURRENT STATE"}
                </button>
              </div>

              <div className="ai-meta">
                <span>RISK LEVEL <b style={{ color: prototypeRiskColor }}>{displayAnalysis.riskLevel}</b></span>
                <span>CONFIDENCE <b>{displayAnalysis.confidence}</b></span>
                <span>DATA CONFIDENCE <b>{validationResult.overallConfidence}%</b></span>
                <span>TIME <b>{new Date(displayAnalysis.generatedAt).toLocaleTimeString("en-GB", { hour12: false })}</b></span>
              </div>

              <div className="ai-columns">
                <div>
                  <span className="ai-label">WHY THIS LEVEL</span>
                  <p>{displayAnalysis.why}</p>
                  <span className="ai-label">CONTRIBUTING FACTORS</span>
                  <ul>
                    {displayAnalysis.factors.map((factor, index) => (
                      <li key={`${factor}-${index}`}>{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="ai-label">RECOMMENDED SAFETY ACTIONS</span>
                  <ul>
                    {displayAnalysis.actions.map((action, index) => (
                      <li key={`${action}-${index}`}>{action}</li>
                    ))}
                  </ul>
                  <div className="ai-warning">
                    <ShieldAlert size={14} />
                    <span>{displayAnalysis.warning}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual AI Assistant with 4 Preset Roadmap Questions */}
            <div className="copilot-card panel">
              <div className="panel-title">
                <span><Sparkles size={14} /> LANDSORA AI Q&A ASSISTANT</span>
                <span className="mono">{assistantMutation.isPending ? "THINKING…" : "READY"}</span>
              </div>
              <div className="assistant-box">
                <div className="preset-question-pills">
                  <button onClick={() => askAssistant("What is the current risk level in my area?")}>
                    📍 What is current risk level?
                  </button>
                  <button onClick={() => askAssistant("Why did the landslide risk increase?")}>
                    📈 Why did risk increase?
                  </button>
                  <button onClick={() => askAssistant("What should I do after receiving a warning?")}>
                    🛡️ What should I do after warning?
                  </button>
                  <button onClick={() => askAssistant("Explain the weather and risk data shown on the dashboard.")}>
                    📊 Explain weather & risk data
                  </button>
                </div>

                <div className="assistant-input">
                  <input
                    type="text"
                    value={assistantQuery}
                    onChange={e => setAssistantQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askAssistant()}
                    placeholder="Ask about slope telemetry, road corridors, or safety precautions..."
                    aria-label="Assistant query"
                  />
                  <button onClick={() => askAssistant()} disabled={assistantMutation.isPending}><Send size={14} /></button>
                </div>
                {assistantMutation.data && (
                  <div className="assistant-answer">
                    <p>{assistantMutation.data.answer}</p>
                    <small>AI-GENERATED EXPLANATION BASED ON VALIDATED TELEMETRY · {new Date(assistantMutation.data.generatedAt).toLocaleTimeString("en-GB", { hour12: false })}</small>
                  </div>
                )}
              </div>
            </div>

            {/* Executive Situation Summary */}
            <div className="impact-card panel">
              <div className="panel-title">
                <span><Users size={14} /> EXECUTIVE SITUATION SUMMARY</span>
                <span className="mono">{responsePriority}</span>
              </div>
              <div className="impact-metrics">
                <span><b style={{ color: prototypeRiskColor }}>{prototypeRiskLevel}</b><small>SELECTED RISK</small></span>
                <span><b>{exposure.toLocaleString()}</b><small>POPULATION EXPOSURE*</small></span>
                <span><b>{roadRows.filter(r => r.status === "AT RISK" || r.status === "BLOCKED").length}</b><small>ROADS TO REVIEW</small></span>
                <span><b>{responsePriority}</b><small>RESPONSE LEVEL</small></span>
              </div>
              <div className="impact-list">
                <span><MapPinned size={13} /> VILLAGES POTENTIALLY AFFECTED <b>{prototypeRiskScore >= 76 ? 3 : prototypeRiskScore >= 51 ? 2 : 1}</b></span>
                <span><Hospital size={13} /> EMERGENCY ACCESS <b>{prototypeRiskScore >= 76 ? "LIMITED" : "AVAILABLE"}</b></span>
                <span><Route size={13} /> ALTERNATIVE ROUTE <b>{prototypeRiskScore >= 76 ? "REVIEW REQUIRED" : "AVAILABLE"}</b></span>
              </div>
              <small className="impact-disclaimer">* Prototype exposure estimate for demonstration only. Validate with approved population datasets.</small>
            </div>

            {/* Road Corridor Connectivity */}
            <div className="road-card panel">
              <div className="panel-title">
                <span><Route size={14} /> ROAD CONNECTIVITY INTELLIGENCE</span>
                <span className="mono">PROTOTYPE</span>
              </div>
              <p className="module-intro">Smart road status inferred from the prototype risk surface.</p>
              {roadRows.map(row => (
                <div className="road-row" key={row.name}>
                  <div>
                    <b>{row.name}</b>
                    <small>{row.distance} from selected risk surface · {row.villages} village(s)</small>
                  </div>
                  <span className={`road-status road-${row.status.toLowerCase().replace(" ", "-")}`}>{row.status}</span>
                  <em>CONFIDENCE {row.confidence}</em>
                </div>
              ))}
            </div>

            {/* Weather-Linked Forecast */}
            <div className="forecast-card panel">
              <div className="panel-title">
                <span><CloudRain size={14} /> WEATHER-LINKED RISK FORECAST</span>
                <span className="mono">PROTOTYPE</span>
              </div>
              <div className="forecast-list">
                {forecast.map(item => (
                  <div className="forecast-row" key={item.time}>
                    <span>{item.time}</span>
                    <b>{item.weather}</b>
                    <strong style={{ color: item.score >= 76 ? "#C24B3F" : item.score >= 51 ? "#D6A24E" : "#6FA377" }}>{classify(item.score)}</strong>
                    <em>{item.score}/100</em>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen & Field Reporting */}
            <div className="report-card panel">
              <div className="panel-title">
                <span><Upload size={14} /> CITIZEN / FIELD REPORTING</span>
                <span className="mono">{reportSaved ? "QUEUED" : "READY"}</span>
              </div>
              {reportSaved ? (
                <div className="report-success">
                  <ShieldCheck size={20} />
                  <div>
                    <b>REPORT QUEUED FOR HUMAN VERIFICATION</b>
                    <small>Evidence stored locally in browser storage.</small>
                  </div>
                  <button className="button secondary" onClick={() => setReportSaved(false)}>NEW REPORT</button>
                </div>
              ) : (
                <>
                  <p className="module-intro">Capture slope cracks, movement, landslide activity, or blocked roads.</p>
                  <div className="report-fields">
                    <select value={reportCategory} onChange={e => setReportCategory(e.target.value)} aria-label="Incident category">
                      <option>SLOPE CRACK</option>
                      <option>LANDSLIDE ACTIVITY</option>
                      <option>BLOCKED ROAD</option>
                      <option>FLOODING</option>
                      <option>INFRASTRUCTURE DAMAGE</option>
                    </select>
                    <select value={reportSeverity} onChange={e => setReportSeverity(e.target.value)} aria-label="Incident severity">
                      <option>LOW</option>
                      <option>MEDIUM</option>
                      <option>HIGH</option>
                      <option>CRITICAL</option>
                    </select>
                  </div>
                  <div className="report-media">
                    <label><Upload size={13} /> ATTACH EVIDENCE<input type="file" accept="image/*,video/*" onChange={e => setReportFile(e.target.files?.[0] ?? null)} /></label>
                    <button className="button secondary" type="button" onClick={requestReportLocation}><MapPin size={13} /> {reportLocation ? "LOCATION ATTACHED" : "USE MY LOCATION"}</button>
                  </div>
                  <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Describe observed slope conditions..." rows={3} />
                  <div className="report-actions">
                    <span>LOCATION: {(reportLocation ?? analysisPoint).latitude.toFixed(3)}, {(reportLocation ?? analysisPoint).longitude.toFixed(3)}{reportFile ? ` · FILE: ${reportFile.name}` : ""}</span>
                    <button className="button primary" onClick={submitReport}>QUEUE REPORT <Send size={14} /></button>
                  </div>
                </>
              )}
            </div>

            {/* System Health & Multilingual Switcher */}
            <div className="health-card panel">
              <div className="panel-title">
                <span><Wifi size={14} /> SYSTEM HEALTH & CONFIGURATION</span>
                <button className="health-toggle" onClick={cycleNetwork} aria-label="Cycle network status">
                  {networkState === "ONLINE" ? <Wifi size={13} /> : <WifiOff size={13} />} {networkState}
                </button>
              </div>
              <div className="health-list">
                <span><i /> DETERMINISTIC RISK ENGINE <b>OPERATIONAL</b></span>
                <span><i /> ANOMALY VALIDATION <b>ACTIVE (0 QUARANTINED)</b></span>
                <span><i /> NASA EONET v3 FEED <b>{liveAvailable ? "CONNECTED" : "FALLBACK"}</b></span>
                <span><i className={networkState === "OFFLINE MODE" ? "offline-dot" : ""} /> OFFLINE REPORT CACHE <b>READY</b></span>
              </div>
              <div className="health-controls">
                <label>
                  NOTIFICATION LANGUAGE
                  <select value={language} onChange={e => changeLanguage(e.target.value)}>
                    {notificationLanguages.map(item => (
                      <option value={item.code} key={item.code}>{item.label} — {item.nativeLabel}</option>
                    ))}
                  </select>
                </label>
                <span>LAST UPDATE <b>{lastUpdate}</b></span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ESP32 Hardware Health Modal */}
      {deviceHealthOpen && (
        <div className="modal-overlay" onClick={() => setDeviceHealthOpen(false)}>
          <div className="modal-content panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Cpu size={16} className="text-amber-400" />
                <h3>ESP32 Field Node Health & Sensor Registry</h3>
              </div>
              <button className="modal-close" onClick={() => setDeviceHealthOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="device-stats-grid">
                <div className="device-stat-box">
                  <span className="stat-label">DEVICE ID</span>
                  <b>landsora-esp32-{zone.id.toLowerCase()}</b>
                </div>
                <div className="device-stat-box">
                  <span className="stat-label">STATUS</span>
                  <b className="text-emerald-400">ONLINE (MQTT TLS)</b>
                </div>
                <div className="device-stat-box">
                  <span className="stat-label">BATTERY VOLTAGE</span>
                  <b>{zone.batteryVoltage}V ({Math.round(((zone.batteryVoltage - 3.2) / 1.0) * 100)}%)</b>
                </div>
                <div className="device-stat-box">
                  <span className="stat-label">WIFI RSSI</span>
                  <b>{zone.wifiRssi} dBm (Good)</b>
                </div>
                <div className="device-stat-box">
                  <span className="stat-label">FREE HEAP</span>
                  <b>184,520 bytes</b>
                </div>
                <div className="device-stat-box">
                  <span className="stat-label">FIRMWARE</span>
                  <b>v1.0.0 (PlatformIO)</b>
                </div>
              </div>

              <div className="sensor-registry-table">
                <h4>ATTACHED SENSOR ARRAY</h4>
                <table>
                  <thead>
                    <tr><th>Sensor</th><th>Pin / Interface</th><th>Status</th><th>Last Sample</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Tipping-Bucket Rain Gauge</td><td>GPIO 4 (Interrupt)</td><td className="text-emerald-400">OK</td><td>{lastUpdate}</td></tr>
                    <tr><td>Capacitive Soil Moisture v1.2</td><td>GPIO 34 (ADC1)</td><td className="text-emerald-400">OK</td><td>{lastUpdate}</td></tr>
                    <tr><td>MPU6050 Dual Inclinometer</td><td>I2C (SDA 21 / SCL 22)</td><td className="text-emerald-400">OK</td><td>{lastUpdate}</td></tr>
                    <tr><td>BME280 Atmospheric Sensor</td><td>I2C (0x76)</td><td className="text-emerald-400">OK</td><td>{lastUpdate}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quarantine & Anomaly Inspector Modal */}
      {quarantineOpen && (
        <div className="modal-overlay" onClick={() => setQuarantineOpen(false)}>
          <div className="modal-content panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <AlertOctagon size={16} className="text-rose-400" />
                <h3>Data Validation & Quarantined Anomalies</h3>
              </div>
              <button className="modal-close" onClick={() => setQuarantineOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">
                Suspicious, unphysical, or sudden sensor spikes are isolated by the deterministic validation engine to prevent false evacuation alarms.
              </p>

              {getStoredQuarantine().length === 0 ? (
                <div className="quarantine-empty">
                  <CheckCircle2 size={24} className="text-emerald-400" />
                  <b>No Quarantined Anomalies</b>
                  <p>All incoming sensor telemetry passed Stage 1–5 validation checks.</p>
                </div>
              ) : (
                <div className="quarantine-table-wrap">
                  <table>
                    <thead>
                      <tr><th>Time</th><th>Node</th><th>Anomaly Type</th><th>Reason</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {getStoredQuarantine().map(q => (
                        <tr key={q.id}>
                          <td>{q.timestamp}</td>
                          <td><b>{q.siteId}</b></td>
                          <td><span className="anomaly-pill">{q.anomalyTypes.join(", ")}</span></td>
                          <td>{q.reason}</td>
                          <td className="text-amber-400">QUARANTINED</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="button secondary mt-4" onClick={() => { clearQuarantineRecords(); setNotice("Quarantine records cleared."); }}>
                    <Trash2 size={13} /> CLEAR QUARANTINE LOGS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operator Approval & Mock Notification Delivery Modal */}
      {operatorApprovalModal && (
        <div className="modal-overlay" onClick={() => setOperatorApprovalModal(false)}>
          <div className="modal-content panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ShieldAlert size={16} className="text-rose-400" />
                <h3>Operator Alert Authorization Workflow</h3>
              </div>
              <button className="modal-close" onClick={() => setOperatorApprovalModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="operator-approval-card">
                <div className="operator-meta-header">
                  <div>
                    <span className="mono text-muted">TARGET NODE: {zone.name} ({zone.id})</span>
                    <h4>CONFIRM EMERGENCY PANCHAYAT BROADCAST</h4>
                  </div>
                  <span className="critical-badge">RISK: {prototypeRiskScore}/100</span>
                </div>

                <div className="operator-form-fields">
                  <label>
                    <span>AUTHORIZING OFFICER</span>
                    <input type="text" value="Officer S. Ramesh (DDMA Commander)" readOnly className="auth-input" />
                  </label>
                  <label>
                    <span>ALERT LANGUAGE</span>
                    <select value={language} onChange={e => changeLanguage(e.target.value)} className="auth-input">
                      {notificationLanguages.map(item => (
                        <option value={item.code} key={item.code}>{item.label} ({item.nativeLabel})</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="notification-preview-box">
                  <span className="mono text-muted">MESSAGE PREVIEW ({language.toUpperCase()}):</span>
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                </div>

                {operatorDeliveryLogs ? (
                  <div className="delivery-log-box">
                    <h5 className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14} /> MOCK BROADCAST COMPLETED</h5>
                    <small>24 Village Panchayats & 1,420 Push Subscribers Notified via Mock Delivery Logs.</small>
                  </div>
                ) : (
                  <div className="operator-actions">
                    <button className="button primary" onClick={handleOperatorApproval} disabled={operatorApprovalMutation.isPending}>
                      <ShieldCheck size={14} /> {operatorApprovalMutation.isPending ? "AUTHORIZING..." : "OFFICIALLY AUTHORIZE & BROADCAST"}
                    </button>
                    <button className="button secondary" onClick={() => setOperatorApprovalModal(false)}>CANCEL</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, unit, prev, color }: { icon: React.ReactNode; label: string; value: string; unit: string; prev: number; color: string }) {
  const v = Number(value);
  return (
    <div className="metric">
      <div className="metric-label">{icon}{label}</div>
      <div className="metric-value" style={{ color }}>{value}<small>{unit}</small></div>
      <div className="metric-delta"><ArrowUpRight size={13} /> {delta(v, prev)}</div>
    </div>
  );
}
