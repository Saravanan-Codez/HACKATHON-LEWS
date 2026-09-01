/* Landsora: Dedicated Gemini AI Chatbot & Geotechnical Intelligence Suite */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Compass,
  Gauge,
  Layers,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Wifi,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GeminiChatbot } from "@/components/GeminiChatbot";
import { SearchGroundingPanel } from "@/components/SearchGroundingPanel";
import { MapsGroundingPanel } from "@/components/MapsGroundingPanel";
import { GoogleAuthModal } from "@/components/GoogleAuthModal";
import { useCriticalRiskToast } from "@/contexts/CriticalRiskToastContext";
import {
  detectLanguageForZone,
  detectLanguageFromCoords,
  notificationLanguages,
  type NotificationLanguage,
} from "@/lib/notificationTranslations";

type ZoneKey =
  | "idukki"
  | "wayanad"
  | "nilgiris"
  | "coorg"
  | "munnar"
  | "shimla"
  | "uttara_kannada"
  | "chikkamagaluru"
  | "valparai"
  | "mahad"
  | "chamoli"
  | "darjeeling";

const ZONES_DATA: Record<
  ZoneKey,
  {
    id: ZoneKey;
    name: string;
    state: string;
    node: string;
    rainfall: number;
    soil: number;
    tilt: number;
    riskScore: number;
    riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    color: string;
    elevation: string;
    geology: string;
  }
> = {
  coorg: {
    id: "coorg",
    name: "Kodagu (Coorg) Escarpment",
    state: "Karnataka",
    node: "KDG-03",
    rainfall: 112.3,
    soil: 78.2,
    tilt: 3.45,
    riskScore: 74,
    riskLevel: "HIGH",
    color: "#D6A24E",
    elevation: "1,100m MSL",
    geology: "Metamorphic Schist & Clay-Rich Subsoil",
  },
  wayanad: {
    id: "wayanad",
    name: "Wayanad Meppadi Slopes",
    state: "Kerala",
    node: "WYD-04",
    rainfall: 168.0,
    soil: 93.2,
    tilt: 6.14,
    riskScore: 94,
    riskLevel: "CRITICAL",
    color: "#C24B3F",
    elevation: "980m MSL",
    geology: "Gneissic Bedrock with Deep Colluvium",
  },
  idukki: {
    id: "idukki",
    name: "Idukki Hill Tracts",
    state: "Kerala",
    node: "IDK-01",
    rainfall: 142.4,
    soil: 88.5,
    tilt: 4.82,
    riskScore: 86,
    riskLevel: "CRITICAL",
    color: "#C24B3F",
    elevation: "1,200m MSL",
    geology: "Weathered Charnockite & Lateritic Regolith",
  },
  nilgiris: {
    id: "nilgiris",
    name: "Nilgiris Coonoor Ghats",
    state: "Tamil Nadu",
    node: "NLG-05",
    rainfall: 78.5,
    soil: 64.0,
    tilt: 2.15,
    riskScore: 58,
    riskLevel: "MEDIUM",
    color: "#D6A24E",
    elevation: "1,850m MSL",
    geology: "Laterite Cap over Granulite",
  },
  uttara_kannada: {
    id: "uttara_kannada",
    name: "Uttara Kannada (Ankola/Sirsi)",
    state: "Karnataka",
    node: "UKA-02",
    rainfall: 135.2,
    soil: 81.4,
    tilt: 4.10,
    riskScore: 81,
    riskLevel: "CRITICAL",
    color: "#C24B3F",
    elevation: "620m MSL",
    geology: "Coastal Western Ghats Fractured Basalt",
  },
  chikkamagaluru: {
    id: "chikkamagaluru",
    name: "Chikkamagaluru Charmadi",
    state: "Karnataka",
    node: "CHK-01",
    rainfall: 98.4,
    soil: 69.8,
    tilt: 2.80,
    riskScore: 69,
    riskLevel: "HIGH",
    color: "#D6A24E",
    elevation: "1,450m MSL",
    geology: "Weathered Hornblende & Banded Iron Formation",
  },
  munnar: {
    id: "munnar",
    name: "Munnar Gap Road",
    state: "Kerala",
    node: "MNR-07",
    rainfall: 96.2,
    soil: 70.2,
    tilt: 2.90,
    riskScore: 68,
    riskLevel: "HIGH",
    color: "#D6A24E",
    elevation: "1,550m MSL",
    geology: "Fractured Hornblende Gneiss",
  },
  valparai: {
    id: "valparai",
    name: "Valparai & Anamalai Hills",
    state: "Tamil Nadu",
    node: "VLP-08",
    rainfall: 88.0,
    soil: 66.5,
    tilt: 2.30,
    riskScore: 62,
    riskLevel: "HIGH",
    color: "#D6A24E",
    elevation: "1,050m MSL",
    geology: "Anamalai Granitic Complex",
  },
  mahad: {
    id: "mahad",
    name: "Mahad & Varandha Ghat",
    state: "Maharashtra",
    node: "MHD-09",
    rainfall: 110.5,
    soil: 77.5,
    tilt: 3.50,
    riskScore: 76,
    riskLevel: "CRITICAL",
    color: "#C24B3F",
    elevation: "820m MSL",
    geology: "Deccan Traps Layered Basalt Flows",
  },
  shimla: {
    id: "shimla",
    name: "Shimla Bypass Ridge",
    state: "Himachal Pradesh",
    node: "SHM-10",
    rainfall: 44.0,
    soil: 38.2,
    tilt: 0.95,
    riskScore: 28,
    riskLevel: "LOW",
    color: "#6FA377",
    elevation: "2,200m MSL",
    geology: "Jutogh Metasedimentary Series",
  },
  chamoli: {
    id: "chamoli",
    name: "Chamoli & Joshimath Corridor",
    state: "Uttarakhand",
    node: "CHM-11",
    rainfall: 62.0,
    soil: 54.0,
    tilt: 2.10,
    riskScore: 54,
    riskLevel: "MEDIUM",
    color: "#D6A24E",
    elevation: "1,890m MSL",
    geology: "Main Central Thrust Shear Zone",
  },
  darjeeling: {
    id: "darjeeling",
    name: "Darjeeling & Kurseong Slopes",
    state: "West Bengal",
    node: "DJE-06",
    rainfall: 104.0,
    soil: 76.8,
    tilt: 3.80,
    riskScore: 75,
    riskLevel: "CRITICAL",
    color: "#C24B3F",
    elevation: "2,050m MSL",
    geology: "Darjeeling Gneiss & Mica Schist",
  },
};

export default function AiChatbotPage() {
  const [selectedZoneKey, setSelectedZoneKey] = useState<ZoneKey>("idukki");
  const [activeTab, setActiveTab] = useState<"CHATBOT" | "SEARCH_GROUNDING" | "MAPS_GROUNDING" | "RISK_SYNTHESIS">("CHATBOT");
  const [language, setLanguage] = useState<NotificationLanguage>("EN");
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentZone = ZONES_DATA[selectedZoneKey];

  const authMeQuery = trpc.auth.me.useQuery();
  const quotaQuery = trpc.chat.quota.useQuery(undefined, { refetchInterval: 15000 });
  const quota = quotaQuery.data?.quota;
  const { triggerCriticalAlert, simulateCriticalAlert } = useCriticalRiskToast();

  const handleZoneChange = (key: ZoneKey) => {
    setSelectedZoneKey(key);
    const z = ZONES_DATA[key];
    if (z.riskLevel === "CRITICAL") {
      triggerCriticalAlert({
        nodeId: z.node,
        zoneName: z.name,
        state: z.state,
        riskScore: z.riskScore,
        riskLevel: "CRITICAL",
        rainfall: z.rainfall,
        soilMoisture: z.soil,
        tiltDegrees: z.tilt,
        triggerReason: `Sensor thresholds critical: Rainfall ${z.rainfall}mm & Tilt ${z.tilt}° at ${z.name}`,
        thresholdExceeded: `Risk Score ${z.riskScore}% · CRITICAL HAZARD`,
      });
    }
    if (autoDetectLanguage) {
      const detected = detectLanguageForZone(key);
      setLanguage(detected);
    }
  };

  useEffect(() => {
    if (autoDetectLanguage) {
      const detected = detectLanguageForZone(selectedZoneKey);
      setLanguage(detected);
    }
  }, [selectedZoneKey, autoDetectLanguage]);

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      setNotice("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = detectLanguageFromCoords(pos.coords.latitude, pos.coords.longitude);
        setLanguage(detected);
        setNotice(`📍 GPS Location verified: regional language set to ${detected}.`);
      },
      () => {
        const fallback = detectLanguageForZone(selectedZoneKey);
        setLanguage(fallback);
        setNotice(`GPS unavailable. Defaulted to active zone language: ${fallback}.`);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#151413] text-[#F3F0E6] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. TOP OPERATIONAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#1E1D1B]/95 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Page Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 text-xs font-mono text-stone-300 hover:text-stone-100 transition-colors border border-stone-700/50"
              title="Return to Main Dashboard"
            >
              <ArrowLeft size={14} />
              <span>DASHBOARD</span>
            </Link>

            <div className="h-4 w-px bg-stone-700/60 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                <Sparkles size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xs sm:text-sm font-bold tracking-wide text-stone-100 font-mono">
                    AI COMPANION
                  </h1>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    GEMINI 3.5 FLASH
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-400 hidden sm:block">
                  Geotechnical Decision Support, IMD Grounding & Evacuation Navigation
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls: Regional Language & Google Auth Status */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher
              language={language}
              autoDetectLanguage={autoDetectLanguage}
              onLanguageChange={(l) => {
                setLanguage(l);
                setNotice(`Language switched to ${l}`);
              }}
              onAutoDetectToggle={(next) => {
                setAutoDetectLanguage(next);
                if (next) {
                  const autoLang = detectLanguageForZone(selectedZoneKey);
                  setLanguage(autoLang);
                  setNotice(`📍 Auto-region detection active: set to ${autoLang}.`);
                }
              }}
              onDetectGpsLocation={handleDetectGpsLocation}
              selectedZone={selectedZoneKey}
            />

            {/* Google Account Authentication Status & Quota */}
            {authMeQuery.data?.user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGoogleAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors shadow-sm"
                  title={`Connected Google Account: ${authMeQuery.data.user.email || authMeQuery.data.user.name}`}
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="font-mono text-[11px]">
                    {authMeQuery.data.user.email?.split("@")[0] || authMeQuery.data.user.name || "GOOGLE VERIFIED"}
                  </span>
                </button>
                {quota?.isUnlimited ? (
                  <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    🛡️ UNLIMITED
                  </span>
                ) : (
                  <span
                    className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono"
                    title={`Daily limit: ${quota?.limit || 30} queries. Resets in ${quota?.resetsInHours || 24}h`}
                  >
                    ⚡ {quota?.remaining ?? 30}/{quota?.limit ?? 30} QUOTA
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setGoogleAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <Sparkles size={13} />
                <span>SIGN IN WITH GOOGLE</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. ZONE TELEMETRY SELECTOR BAR */}
      <div className="bg-[#1A1917] border-b border-stone-800/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Zone Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <MapPin size={12} className="text-amber-400" /> ACTIVE ZONE:
            </span>
            {(Object.keys(ZONES_DATA) as ZoneKey[]).map((key) => {
              const z = ZONES_DATA[key];
              const isSelected = selectedZoneKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleZoneChange(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-stone-800/70 hover:bg-stone-700/80 text-stone-300 hover:text-stone-100 border border-stone-700/50"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? "#151413" : z.color }}
                  />
                  <span>{z.name.split(" ")[0]}</span>
                  <span className="text-[10px] font-mono opacity-80">({z.node})</span>
                </button>
              );
            })}
          </div>

          {/* Active Zone Live Sensor Readings */}
          <div className="flex items-center gap-3 text-xs font-mono text-stone-300 shrink-0 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800">
            <div className="flex items-center gap-1.5" title="Monitored 24h Cumulative Rainfall">
              <CloudRain size={13} className="text-blue-400" />
              <span>RAIN: <b>{currentZone.rainfall}mm</b></span>
            </div>
            <div className="h-3 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5" title="Volumetric Water Content Soil Saturation">
              <Activity size={13} className="text-amber-400" />
              <span>SOIL: <b>{currentZone.soil}%</b></span>
            </div>
            <div className="h-3 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5" title="Biaxial Inclinometer Slope Displacement">
              <Compass size={13} className="text-purple-400" />
              <span>TILT: <b>{currentZone.tilt}°</b></span>
            </div>
            <div className="h-3 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5 font-bold" style={{ color: currentZone.color }}>
              <ShieldAlert size={13} />
              <span>{currentZone.riskLevel} ({currentZone.riskScore}%)</span>
            </div>
            <div className="h-3 w-px bg-stone-700" />
            <button
              type="button"
              onClick={() =>
                simulateCriticalAlert({
                  nodeId: currentZone.node,
                  zoneName: currentZone.name,
                  state: currentZone.state,
                  rainfall: currentZone.rainfall,
                  soilMoisture: currentZone.soil,
                  tiltDegrees: currentZone.tilt,
                  riskScore: currentZone.riskScore,
                  riskLevel: "CRITICAL",
                })
              }
              className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-mono border border-red-500/30 transition-colors"
              title="Test the Critical Sensor Toast Notification System"
            >
              TEST TOAST
            </button>
          </div>
        </div>
      </div>

      {/* 3. AI SUITE WORKSPACE & TABS */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 flex-1 flex flex-col w-full">
        {/* Navigation Tabs with Smooth Horizontal Scroll on Mobile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-4 p-1.5 rounded-xl bg-stone-900/90 border border-stone-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab("CHATBOT")}
              className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === "CHATBOT"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-300 hover:text-stone-100 hover:bg-stone-800/70"
              }`}
            >
              <Sparkles size={14} />
              <span>AI COMPANION</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/25 rounded">MULTI-TURN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SEARCH_GROUNDING")}
              className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === "SEARCH_GROUNDING"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-stone-300 hover:text-stone-100 hover:bg-stone-800/70"
              }`}
            >
              <Search size={14} />
              <span>SEARCH GROUNDING (IMD)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/25 rounded">CITATIONS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MAPS_GROUNDING")}
              className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === "MAPS_GROUNDING"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-stone-300 hover:text-stone-100 hover:bg-stone-800/70"
              }`}
            >
              <MapPin size={14} />
              <span>MAPS GROUNDING (PASSES)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/25 rounded">CORRIDORS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RISK_SYNTHESIS")}
              className={`px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === "RISK_SYNTHESIS"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "text-stone-300 hover:text-stone-100 hover:bg-stone-800/70"
              }`}
            >
              <Activity size={14} />
              <span>SLOPE STABILITY</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10.5px] font-mono text-stone-400 px-2 shrink-0">
            <span>LOCATION: <b className="text-stone-200">{currentZone.name}</b></span>
          </div>
        </div>

        {/* Tab Viewports */}
        <div className="flex-1 flex flex-col">
          {activeTab === "CHATBOT" && (
            <div className="flex-1 flex flex-col">
              <GeminiChatbot
                location={currentZone.name}
                rainfall={currentZone.rainfall}
                soil={currentZone.soil}
                tilt={currentZone.tilt}
                riskScore={currentZone.riskScore}
                riskLevel={currentZone.riskLevel}
                language={language}
                onOpenGoogleAuth={() => setGoogleAuthModalOpen(true)}
              />
            </div>
          )}

          {activeTab === "SEARCH_GROUNDING" && (
            <div className="flex-1">
              <SearchGroundingPanel
                location={currentZone.name}
                language={language}
                onOpenGoogleAuth={() => setGoogleAuthModalOpen(true)}
              />
            </div>
          )}

          {activeTab === "MAPS_GROUNDING" && (
            <div className="flex-1">
              <MapsGroundingPanel
                location={currentZone.name}
                language={language}
                onOpenGoogleAuth={() => setGoogleAuthModalOpen(true)}
              />
            </div>
          )}

          {activeTab === "RISK_SYNTHESIS" && (
            <div className="p-6 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-200 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                    EXPLAINABLE AI GEOTECHNICAL SYNTHESIS · {currentZone.name}
                  </span>
                  <h2 className="text-xl font-bold text-stone-100 mt-1">
                    Multi-Factor Slope Failure Probability & Trigger Matrix
                  </h2>
                </div>
                <div
                  className="px-4 py-2 rounded-xl font-bold font-mono text-sm border flex items-center gap-2"
                  style={{
                    backgroundColor: `${currentZone.color}20`,
                    borderColor: currentZone.color,
                    color: currentZone.color,
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>{currentZone.riskLevel} RISK · {currentZone.riskScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-xs font-mono text-stone-400">RAINFALL ANOMALY</span>
                  <div className="text-2xl font-bold text-blue-400 mt-1">{currentZone.rainfall} mm</div>
                  <p className="text-xs text-stone-400 mt-1">
                    Threshold: 100mm/24h. Excess monsoonal downpour saturates topsoil matrix.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-xs font-mono text-stone-400">PORE WATER PRESSURE</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{currentZone.soil}% SATURATION</div>
                  <p className="text-xs text-stone-400 mt-1">
                    Capacitive moisture probe shows critical liquefaction danger zone.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
                  <span className="text-xs font-mono text-stone-400">SHEAR STRAIN DISPLACEMENT</span>
                  <div className="text-2xl font-bold text-purple-400 mt-1">{currentZone.tilt}° INCLINOMETER</div>
                  <p className="text-xs text-stone-400 mt-1">
                    Biaxial tilt sensor registers progressive micro-slip along slip surface.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1 text-amber-300">
                  <Sparkles size={14} /> AI RECOMMENDATION FOR OPERATORS & DISTRICT COLLECTORATE
                </div>
                <p className="leading-relaxed text-stone-300">
                  Execute immediate Stage 2 alert broadcast to revenue divisional officers. Restrict heavy vehicular transit along the ghat corridor. Mobilize State Disaster Response Force (SDRF) rapid evacuation units to designated relief shelters at high-elevation schools.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. GOOGLE AUTH MODAL */}
      <GoogleAuthModal
        isOpen={googleAuthModalOpen}
        onClose={() => setGoogleAuthModalOpen(false)}
        onSuccess={() => {
          authMeQuery.refetch();
          setNotice("Google Account successfully verified for AI operations.");
        }}
      />

      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-emerald-400" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-stone-400 hover:text-stone-200 ml-2"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
