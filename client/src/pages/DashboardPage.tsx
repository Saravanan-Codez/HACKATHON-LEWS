/* LEWS Dedicated Operational Application Dashboard: High-productivity Surveyor's Field Console */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { getDataPresentation } from "@/lib/dataPresentation";
import { createQueuedReport, saveQueuedReport } from "@/lib/reportQueue";
import { getStoredNotificationLanguage, notificationLanguages, renderNotification, saveNotificationLanguage, type NotificationKind, type NotificationLanguage } from "@/lib/notificationTranslations";
import { shouldRefreshAiAnalysis } from "@/lib/aiAnalysisFlow";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Compass,
  Crosshair,
  Gauge,
  Globe2,
  Hospital,
  Layers3,
  MapPin,
  MapPinned,
  Radio,
  RotateCcw,
  Route,
  Send,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sliders,
  Sprout,
  Upload,
  User,
  Users,
  Waves,
  Wifi,
  WifiOff,
  Wind,
  X,
} from "lucide-react";

const ASSET_BASE = "/assets";
const assetUrl = (file: string) => {
  const cleanName = file.replace(/_[a-f0-9]+(\.[a-z]+)$/i, "$1");
  return `${ASSET_BASE}/${cleanName}`;
};

type Tier = "STABLE" | "WATCH" | "CRITICAL";
type Zone = { id:string; name:string; region:string; coords:string; rainfall:number; soil:number; tilt:number; baseline:number; sensors:number; history:number[]; tier:Tier; score:number; sensitivity:{rain:number; soil:number; tilt:number} };
type AlertEvent = { time:string; zone:string; transition:string; risk:number };
type EonetEvent = { id:string; title:string; date:string; latitude:number; longitude:number; source:string; status:string };
type RoadStatus = "OPEN" | "RESTRICTED" | "AT RISK" | "BLOCKED" | "UNKNOWN";

const initialZones: Zone[] = [
  {id:"CHK-01",name:"Chikkamagaluru",region:"Western Ghats",coords:"13.3153, 75.7754",rainfall:12.8,soil:57.4,tilt:0.062,baseline:31,sensors:10,history:[31,32,32,33,32,34,35,34,35,36,35,36],tier:"STABLE",score:35,sensitivity:{rain:0.9,soil:0.85,tilt:0.8}},
  {id:"KDG-03",name:"Kodagu",region:"Western Ghats",coords:"12.3375, 75.8069",rainfall:18.4,soil:78.2,tilt:0.084,baseline:42,sensors:12,history:[52,55,56,58,57,60,59,61,62,60,63,64],tier:"WATCH",score:64,sensitivity:{rain:1.15,soil:1.12,tilt:0.9}},
  {id:"UKA-02",name:"Uttara Kannada",region:"Western Ghats",coords:"14.7937, 74.6869",rainfall:9.6,soil:49.8,tilt:0.057,baseline:28,sensors:9,history:[28,29,30,29,31,30,30,31,32,31,31,32],tier:"STABLE",score:32,sensitivity:{rain:0.92,soil:0.86,tilt:0.82}},
  {id:"WYD-04",name:"Wayanad",region:"Western Ghats",coords:"11.6854, 76.1320",rainfall:15.1,soil:71.4,tilt:0.068,baseline:37,sensors:11,history:[43,44,45,44,46,47,48,47,49,48,49,50],tier:"WATCH",score:50,sensitivity:{rain:0.92,soil:1.18,tilt:0.86}},
  {id:"NLG-05",name:"Nilgiris",region:"Tamil Nadu",coords:"11.4102, 76.6950",rainfall:11.2,soil:53.6,tilt:0.092,baseline:39,sensors:8,history:[41,42,41,43,44,43,45,44,46,45,47,48],tier:"WATCH",score:48,sensitivity:{rain:0.88,soil:0.9,tilt:1.2}},
  {id:"DJE-06",name:"Darjeeling",region:"Eastern Himalayas",coords:"27.0410, 88.2663",rainfall:13.5,soil:61.7,tilt:0.101,baseline:44,sensors:13,history:[50,51,52,51,53,54,53,55,54,56,55,57],tier:"WATCH",score:57,sensitivity:{rain:0.9,soil:0.94,tilt:1.22}},
];

const statusColor = (tier:Tier) => tier === "CRITICAL" ? "#C24B3F" : tier === "WATCH" ? "#D6A24E" : "#6FA377";
const classify = (score:number):Tier => score >= 71 ? "CRITICAL" : score >= 40 ? "WATCH" : "STABLE";
const clock = () => new Date().toLocaleTimeString("en-GB", {hour12:false});
const eventAgeDays = (date:string) => Math.max(0, Math.floor((Date.now()-new Date(date).getTime())/86400000));
const eventTone = (date:string) => eventAgeDays(date) <= 2 ? "very-recent" : eventAgeDays(date) <= 7 ? "recent" : eventAgeDays(date) <= 30 ? "high-interest" : "old";
const eventPosition = (event:EonetEvent,index:number) => { const x=Math.max(6,Math.min(94,((event.longitude-68)/28)*100)); const y=Math.max(8,Math.min(92,(1-((event.latitude-8)/28))*100)); return [Number.isFinite(x)?x:18+(index%5)*14,Number.isFinite(y)?y:24+(index%4)*15] as const; };
const distanceKm = (a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}) => { const r=6371; const p=Math.PI/180; const dLat=(b.latitude-a.latitude)*p; const dLon=(b.longitude-a.longitude)*p; const q=Math.sin(dLat/2)**2+Math.cos(a.latitude*p)*Math.cos(b.latitude*p)*Math.sin(dLon/2)**2; return r*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q)); };

function calcScore(z:Zone) {
  const rain = Math.min(100, (z.rainfall / 32) * 100) * z.sensitivity.rain;
  const soil = Math.min(100, z.soil) * z.sensitivity.soil;
  const tilt = Math.min(100, (z.tilt / 0.16) * 100) * z.sensitivity.tilt;
  return Math.max(0, Math.min(100, Math.round(0.4 * rain + 0.35 * soil + 0.25 * tilt + z.baseline * 0.08)));
}

function delta(a:number,b:number) { const d = a-b; return `${d >= 0 ? "+" : ""}${d.toFixed(1)}`; }

function TinySpark({values,color}:{values:number[];color:string}) {
  const min=Math.min(...values), max=Math.max(...values);
  const points=values.map((v,i)=>`${(i/(values.length-1))*100},${34-((v-min)/Math.max(1,max-min))*24}`).join(" ");
  const current=Math.round(values[values.length-1]);
  return <svg className="spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-label={`Risk trend ending at ${current} out of 100`}><polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>;
}

function TrendChart({values,tier}:{values:number[];tier:Tier}) {
  const points=values.map((v,i)=>`${(i/(values.length-1))*100},${100-v}`).join(" ");
  return <div className="trend-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={statusColor(tier)} stopOpacity=".22"/><stop offset="1" stopColor={statusColor(tier)} stopOpacity="0"/></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#chartFill)"/><polyline points={points} fill="none" stroke={statusColor(tier)} strokeWidth="2.2" vectorEffect="non-scaling-stroke" /></svg><div className="chart-labels"><span>−16 READINGS</span><span>NOW</span></div></div>;
}

export default function DashboardPage() {
  const [zones,setZones] = useState(initialZones);
  const [selected,setSelected] = useState("KDG-03");
  const [events,setEvents] = useState<AlertEvent[]>([]);
  const [lastUpdate,setLastUpdate] = useState(clock());
  const [scenario,setScenario] = useState("NORMAL DAY");
  const [storm,setStorm] = useState(false);
  const [stormProgress,setStormProgress] = useState(0);
  const [ack,setAck] = useState(false);
  const [notice,setNotice] = useState<string | null>(null);
  const [profile,setProfile] = useState(false);
  const [demoMode,setDemoMode] = useState(false);
  const [eventFocus,setEventFocus] = useState<EonetEvent | null>(null);
  const [selectedPoint,setSelectedPoint] = useState<{latitude:number;longitude:number}|null>(null);
  const [reportOpen,setReportOpen] = useState(false);
  const [reportCategory,setReportCategory] = useState("SLOPE CRACK");
  const [reportSeverity,setReportSeverity] = useState("MEDIUM");
  const [reportDescription,setReportDescription] = useState("");
  const [reportFile,setReportFile] = useState<File | null>(null);
  const [reportSaved,setReportSaved] = useState(false);
  const [reportLocation,setReportLocation] = useState<{latitude:number;longitude:number}|null>(null);
  const [networkState,setNetworkState] = useState<"ONLINE"|"LIMITED NETWORK"|"OFFLINE MODE">("ONLINE");
  const [language,setLanguage] = useState<NotificationLanguage>(()=>getStoredNotificationLanguage());
  const [notificationKind,setNotificationKind] = useState<NotificationKind>("CRITICAL_WARNING");
  const timer=useRef<number | undefined>(undefined);

  const liveQuery = trpc.landslides.list.useQuery(undefined,{staleTime:300000,retry:1});
  const platformQuery = trpc.platform.capabilities.useQuery(undefined,{staleTime:300000});
  const liveEvents: EonetEvent[] = liveQuery.data?.events ?? [];
  const liveAvailable = Boolean(liveQuery.data?.available);
  const displayedEvents = demoMode ? [] : liveEvents;
  const recentEvents = liveEvents.filter(event=>eventAgeDays(event.date)<=30);
  const zone = zones.find(z=>z.id===selected) || zones[1];
  const analysisPoint = selectedPoint ?? {latitude:Number(zone.coords.split(",")[0]),longitude:Number(zone.coords.split(",")[1])};
  const nearestEvent = useMemo(()=> (demoMode ? [] : liveEvents).reduce<{event:EonetEvent|null;distance:number}>((best,event)=>{ const distance=distanceKm(analysisPoint,event); return !best.event || distance<best.distance ? {event,distance} : best; },{event:null,distance:Infinity}),[liveEvents,analysisPoint.latitude,analysisPoint.longitude,demoMode]);
  const riskInputs = useMemo(()=>({ rainfallScore:Math.min(100,zone.rainfall/32*100), terrainScore:Math.min(100,zone.tilt/.16*100), historicalLandslideScore:zone.baseline, recentEventScore:demoMode?zone.history.slice(-3).reduce((sum,value)=>sum+value,0)/3:recentEvents.length?Math.min(100,recentEvents.length*12):0 }),[zone.rainfall,zone.tilt,zone.baseline,zone.history,demoMode,recentEvents.length]);
  const riskQuery = trpc.risk.score.useQuery(riskInputs,{staleTime:2000});
  const aiAnalysisMutation = trpc.risk.aiAnalysis.useMutation();
  const assistantMutation = trpc.risk.assistant.useMutation();
  const [assistantQuery, setAssistantQuery] = useState("");
  const [lastAnalyzedLevel, setLastAnalyzedLevel] = useState<string|null>(null);
  const prototypeRiskScore = riskQuery.data?.score ?? zone.score;
  const prototypeRiskLevel = riskQuery.data?.level ?? zone.tier;
  const prototypeRiskColor = prototypeRiskLevel==="CRITICAL"?"#C24B3F":prototypeRiskLevel==="HIGH"?"#D6A24E":prototypeRiskLevel==="MODERATE"?"#C28A70":"#6FA377";
  const prototypeTier:Tier = prototypeRiskLevel==="CRITICAL"||prototypeRiskLevel==="HIGH"?"CRITICAL":prototypeRiskLevel==="MODERATE"?"WATCH":"STABLE";
  const dataView = getDataPresentation({demoMode,available:liveAvailable,queryError:Boolean(liveQuery.error),eventCount:liveEvents.length});
  const exposure = prototypeRiskScore >= 76 ? 2400 : prototypeRiskScore >= 51 ? 1100 : 420;
  const roadStatus = (threshold:number):RoadStatus => prototypeRiskScore >= threshold ? (prototypeRiskScore >= 86 ? "BLOCKED" : "AT RISK") : prototypeRiskScore >= 45 ? "RESTRICTED" : "OPEN";
  const roadRows = [{name:"NH 10 / Teesta Corridor",status:roadStatus(58),distance:"1.2 km",villages:3,confidence:prototypeRiskScore>=76?"MEDIUM":"LOW"},{name:"Kodagu Valley Link",status:roadStatus(48),distance:"0.8 km",villages:2,confidence:prototypeRiskScore>=51?"MEDIUM":"LOW"},{name:"Wayanad Village Road",status:roadStatus(68),distance:"2.4 km",villages:1,confidence:"LOW"}];
  const forecast = [{time:"NOW",weather:zone.rainfall>18?"HEAVY RAIN":"LIGHT RAIN",score:prototypeRiskScore},{time:"+6 HOURS",weather:zone.rainfall>15?"VERY HEAVY RAIN":"MODERATE RAIN",score:Math.min(100,prototypeRiskScore+9)},{time:"+12 HOURS",weather:"MODERATE RAIN",score:Math.min(100,prototypeRiskScore+4)},{time:"+24 HOURS",weather:"LIGHT RAIN",score:Math.max(0,prototypeRiskScore-7)},{time:"+48 HOURS",weather:"CLEARING",score:Math.max(0,prototypeRiskScore-11)}];
  const responsePriority = prototypeRiskScore>=76 ? "PRIORITY 1" : prototypeRiskScore>=51 ? "PRIORITY 2" : "PRIORITY 3";
  const notification = renderNotification(notificationKind, language, {place: zone.name, road: roadRows[0].name});

  useEffect(()=>{
    timer.current=window.setInterval(()=>{
      setZones(prev=>prev.map(z=>{
        const oldTier=z.tier;
        const stormBoost=storm ? stormProgress/100 : 0;
        const intensity=scenario==="HEAVY RAIN" ? 1.55 : scenario==="EXTREME SLOPE EVENT" ? 1.8 : 1;
        const rain=Math.max(2,Math.min(34,z.rainfall + (Math.random()-.46)*intensity + stormBoost*1.25));
        const soil=Math.max(25,Math.min(94,z.soil + (rain>z.rainfall?.16:-.08)*intensity + (Math.random()-.52)*.45 + stormBoost*.28));
        const tilt=Math.max(.025,Math.min(.145,z.tilt + (Math.random()-.47)*.002*intensity + stormBoost*.0009));
        const next={...z,rainfall:Number(rain.toFixed(1)),soil:Number(soil.toFixed(1)),tilt:Number(tilt.toFixed(3))};
        const score=calcScore(next);
        const tier=classify(score);
        if(tier!==oldTier){
          setEvents(es=>[{time:clock(),zone:z.name,transition:`${oldTier} → ${tier}`,risk:score},...es].slice(0,6));
        }
        return {...next,score,tier,history:[...z.history.slice(-15),score]};
      }));
      setLastUpdate(clock());
    },2500);
    return ()=>window.clearInterval(timer.current);
  },[scenario,storm,stormProgress]);

  useEffect(()=>{
    if(storm && stormProgress<100){
      const t=window.setTimeout(()=>setStormProgress(p=>Math.min(100,p+6)),1000);
      return ()=>window.clearTimeout(t);
    }
    if(stormProgress>=100) setStorm(false);
  },[storm,stormProgress]);

  const reset=()=>{setZones(initialZones);setEvents([]);setStorm(false);setStormProgress(0);setScenario("NORMAL DAY");setNotice("Simulation reset to baseline conditions.");};
  const runStorm=()=>{setSelected("KDG-03");setScenario("EXTREME SLOPE EVENT");setStormProgress(0);setStorm(true);setAck(false);setNotice("Storm scenario initiated — escalation timeline active.");};
  const setPreset=(name:string)=>{setScenario(name);setStorm(name!=="NORMAL DAY");setStormProgress(name==="NORMAL DAY"?0:25);setNotice(`${name} preset loaded.`);};
  const handleMapClick=(event:React.MouseEvent<HTMLDivElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    setSelectedPoint({
      latitude:Number((8+(1-(event.clientY-rect.top)/rect.height)*28).toFixed(4)),
      longitude:Number((68+((event.clientX-rect.left)/rect.width)*28).toFixed(4))
    });
    setEventFocus(null);
  };
  const requestReportLocation=()=>{
    if(!navigator.geolocation){setNotice("Location permission is unavailable in this browser.");return;}
    navigator.geolocation.getCurrentPosition(position=>{
      setReportLocation({latitude:Number(position.coords.latitude.toFixed(4)),longitude:Number(position.coords.longitude.toFixed(4))});
      setNotice("Location attached to the local report.");
    },()=>setNotice("Location permission not granted; select a map point instead."));
  };
  const submitReport=()=>{
    const reportId=`LEWS-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`;
    const queued=createQueuedReport({reportId,category:reportCategory,severity:reportSeverity,description:reportDescription,location:reportLocation??analysisPoint,attachment:reportFile?.name??null});
    saveQueuedReport(queued);
    setReportSaved(true);
    setReportOpen(false);
    setNotice(`${reportId} queued for human verification.`);
    setReportDescription("");
    setReportFile(null);
  };
  const cycleNetwork=()=>{
    const next=networkState==="ONLINE"?"LIMITED NETWORK":networkState==="LIMITED NETWORK"?"OFFLINE MODE":"ONLINE";
    setNetworkState(next);
    setNotice(`Network state changed to ${next}. Local report queue remains available.`);
  };
  const changeLanguage=(next:string)=>{
    const selectedLanguage=notificationLanguages.find(item=>item.code===next);
    if(!selectedLanguage)return;
    setLanguage(selectedLanguage.code);
    saveNotificationLanguage(selectedLanguage.code);
    setNotice(`Notification language set to ${selectedLanguage.label}. Future alert previews will use this preference.`);
  };
  const runAiAnalysis=()=>{
    aiAnalysisMutation.mutate({
      location:zone.name,
      rainfall:zone.rainfall,
      weather:forecast[0].weather,
      soil:zone.soil,
      tilt:zone.tilt,
      recentEventsNearby:nearestEvent.distance<=50,
      recentEventCount:recentEvents.length,
      historicalContext:`Prototype baseline ${zone.baseline}/100; source context is ${liveAvailable?"NASA EONET feed available":"real-time source unavailable"}.`,
      calculatedRiskScore:prototypeRiskScore,
      calculatedRiskLevel:prototypeRiskLevel as "LOW"|"MODERATE"|"HIGH"|"CRITICAL",
      language,
      dataAvailable:liveAvailable&&!demoMode
    });
    setLastAnalyzedLevel(prototypeRiskLevel);
  };
  const askAssistant=()=>{
    if(!assistantQuery.trim())return;
    assistantMutation.mutate({
      question:assistantQuery,
      language,
      location:zone.name,
      rainfall:zone.rainfall,
      weather:forecast[0].weather,
      soil:zone.soil,
      tilt:zone.tilt,
      recentEventCount:recentEvents.length,
      calculatedRiskScore:prototypeRiskScore,
      calculatedRiskLevel:prototypeRiskLevel as "LOW"|"MODERATE"|"HIGH"|"CRITICAL",
      dataAvailable:liveAvailable&&!demoMode
    });
  };

  useEffect(()=>{
    if(shouldRefreshAiAnalysis({previousLevel:lastAnalyzedLevel,currentLevel:prototypeRiskLevel,liveAvailable,demoMode})){
      runAiAnalysis();
    }
  },[prototypeRiskLevel,liveAvailable,demoMode,lastAnalyzedLevel]);

  const contributions={
    rain:Math.round(Math.min(100,zone.rainfall/32*100)*zone.sensitivity.rain),
    soil:Math.round(zone.soil*zone.sensitivity.soil),
    tilt:Math.round(Math.min(100,zone.tilt/.16*100)*zone.sensitivity.tilt)
  };
  const reason=contributions.rain>=contributions.soil&&contributions.rain>=contributions.tilt?"Rainfall intensity is currently the strongest contributor.":contributions.soil>=contributions.tilt?"Soil moisture is approaching saturation for this zone.":"Slope tilt is increasing above the local baseline.";

  return (
    <div className="app-shell dashboard-app-shell">
      {/* Fixed Left Instrument Rail */}
      <aside className="instrument-rail">
        <div className="rail-mark"><img src={assetUrl("lews-logo.png")} alt="LEWS contour ridge mark"/></div>
        <span className="rail-line"/>
        <span className="rail-index">00<br/><i/>06</span>
        <div className="rail-meta">FIELD<br/>CONSOLE<br/><b>13° N</b><br/><b>75° E</b></div>
      </aside>

      {/* Top Application Header */}
      <header className="dashboard-app-header">
        <div className="dash-header-left">
          <Link href="/" className="dash-back-btn" title="Back to overview">
            <ArrowLeft size={14} />
            <span>OVERVIEW</span>
          </Link>
          <div className="dash-header-brand">
            <div className="logo-wrap"><img src={assetUrl("lews-logo.png")} alt="LEWS contour logo" /></div>
            <div>
              <div className="brand-name">LEWS CONSOLE</div>
              <div className="brand-sub">HYPERLOCAL FIELD NODE · {zone.name.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="dash-header-controls">
          <button className={`demo-toggle ${demoMode?"is-on":""}`} onClick={()=>setDemoMode(value=>!value)} aria-pressed={demoMode}>
            <span/> DEMO MODE
          </button>
          <button className="dash-network-btn" onClick={cycleNetwork}>
            {networkState==="ONLINE"?<Wifi size={13}/>:<WifiOff size={13}/>} {networkState}
          </button>
          <button className="dash-storm-btn" onClick={runStorm}>
            <Siren size={13} /> RUN STORM SCENARIO
          </button>
          <Link href="/settings" className="dash-settings-link" title="Console Settings">
            <SettingsIcon size={14} />
          </Link>
        </div>
      </header>

      {/* Main Operational Container */}
      <main className="dashboard-main-area">
        {/* Status Bar */}
        <div className="data-status-bar">
          <div>
            <span className="data-status-label">{dataView.tone.toUpperCase()}</span>
            <strong>{dataView.source}</strong>
          </div>
          <span className={dataView.tone==="live"?"data-ok":"data-fallback"}>
            {dataView.tone==="live"?`UPDATED ${new Date(liveQuery.data?.updatedAt || Date.now()).toLocaleTimeString("en-GB",{hour12:false})}`:dataView.tone==="empty"?"FEED REACHABLE · NO REPORTED EVENTS":"USING DEMONSTRATION FALLBACK"}
          </span>
          <span className="data-status-note">
            Active Node: <b>{zone.id} ({zone.coords})</b> · NASA EONET v3 · Interval: 2.5s · Last Update: {lastUpdate}
          </span>
        </div>

        {/* Top 3-Column Primary Grid */}
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
                  className={`zone-row ${z.id===selected?"selected":""}`}
                  onClick={()=>setSelected(z.id)}
                >
                  <div className="zone-info">
                    <div className="zone-top">
                      <span className="status-dot" style={{background:statusColor(z.tier)}}/>
                      <strong>{z.name}</strong>
                      <span className="zone-arrow">{z.score>=z.history[z.history.length-2]?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}</span>
                    </div>
                    <div className="zone-bottom">
                      <div className="zone-signal">
                        <b style={{color:statusColor(z.tier)}}>SENSOR {z.tier}</b>
                        <span className="score">SIGNAL <b>{z.score}</b> <small>/ 100</small></span>
                      </div>
                      <span className="zone-region">{z.region.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="zone-spark-col">
                    <TinySpark values={z.history} color={statusColor(z.tier)}/>
                    <span>RISK TRACE</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="network">
              <div className="panel-title">SENSOR NETWORK <span className="online-mini"><i/> NOMINAL</span></div>
              <div className="network-big">12 / 12 <span>CHANNELS ONLINE</span></div>
              <div className="network-row"><span>DATA LINK</span><b>{demoMode?"SIMULATED":liveAvailable?"NASA EONET":"FALLBACK"}</b></div>
              <div className="network-row"><span>LATENCY</span><b>1.8 SEC</b></div>
              <div className="network-row"><span>PACKET SUCCESS</span><b>99.2%</b></div>
            </div>
          </aside>

          {/* Center Column: Terrain GIS Map */}
          <div id="map-panel" className="map-panel panel">
            <div className="map-head">
              <div>
                <span className="panel-kicker">LIVE MAP / TERRAIN LAYER</span>
                <h3>Monitored sensor state</h3>
              </div>
              <div className="map-head-actions">
                <span className="map-mode"><Layers3 size={14}/> {dataView.label}</span>
              </div>
            </div>
            <div className="map-canvas" onClick={handleMapClick}>
              <img src={assetUrl("lews-contour-texture.png")} alt="Subtle topographic contour texture"/>
              <div className="map-grid"/>
              <svg className="map-contour-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-5 32 C 12 14, 26 54, 42 31 S 74 8, 105 26"/>
                <path d="M-10 44 C 9 29, 21 65, 43 43 S 77 21, 110 38"/>
                <path d="M-8 58 C 13 40, 26 79, 51 57 S 80 34, 108 52"/>
                <path d="M-6 72 C 16 54, 33 91, 57 70 S 84 51, 109 66"/>
                <path d="M-3 85 C 20 69, 37 103, 64 83 S 88 67, 108 80"/>
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

              {zones.map((z,i)=>{
                const positions=[[28,51],[34,62],[23,43],[31,74],[46,57],[75,31]][i];
                return (
                  <button
                    key={z.id}
                    className={`marker ${z.id===selected?"active":""}`}
                    style={{left:`${positions[0]}%`,top:`${positions[1]}%`,color:statusColor(z.tier)}}
                    onClick={(event)=>{event.stopPropagation();setSelected(z.id);setSelectedPoint(null)}}
                  >
                    <span className="marker-pulse"/>
                    <span className="marker-core"/>
                    <label>{z.name.toUpperCase()}</label>
                  </button>
                );
              })}

              {displayedEvents.slice(0,24).map((event,index)=>{
                const [left,top]=eventPosition(event,index);
                return (
                  <button
                    key={event.id}
                    className={`eonet-marker ${eventTone(event.date)}`}
                    style={{left:`${left}%`,top:`${top}%`}}
                    onClick={(clickEvent)=>{clickEvent.stopPropagation();setEventFocus(event)}}
                    aria-label={`NASA EONET event ${event.title}`}
                  >
                    <span/>
                    <b>{eventTone(event.date)==="very-recent"?"NEW":"NASA"}</b>
                  </button>
                );
              })}

              {eventFocus&& (
                <div className="eonet-popover">
                  <button className="popover-close" onClick={()=>setEventFocus(null)} aria-label="Close event details">
                    <X size={13}/>
                  </button>
                  <span className="panel-kicker">NASA EONET / REPORTED EVENT</span>
                  <strong>{eventFocus.title}</strong>
                  <small>{new Date(eventFocus.date).toLocaleString("en-GB")}</small>
                  <small>{eventFocus.latitude.toFixed(3)}° N · {eventFocus.longitude.toFixed(3)}° E</small>
                  <small>STATUS: {eventFocus.status.toUpperCase()} · SOURCE: {eventFocus.source}</small>
                </div>
              )}

              <div className="map-click-hint">CLICK MAP TO ANALYZE LOCATION</div>
              {!demoMode&&liveAvailable&&displayedEvents.length===0&&(
                <div className="map-empty"><AlertTriangle size={14}/> NO CURRENT NASA EONET LANDSLIDE EVENTS IN FEED</div>
              )}
              {selectedPoint&&(
                <div className="selected-point" style={{left:`${Math.max(4,Math.min(96,((selectedPoint.longitude-68)/28)*100))}%`,top:`${Math.max(4,Math.min(96,(1-(selectedPoint.latitude-8)/28)*100))}%`}}>
                  <span/><b>ANALYSIS POINT</b>
                </div>
              )}
              <div className="map-scale"><span>0</span><i/><span>100 km</span></div>
              <div className="map-legend">
                <span><i style={{background:"#6FA377"}}/> SENSOR STABLE</span>
                <span><i style={{background:"#D6A24E"}}/> SENSOR WATCH</span>
                <span><i style={{background:"#C24B3F"}}/> SENSOR CRITICAL</span>
                <span className="eonet-legend"><i/> NASA EONET — REPORTED EVENTS</span>
              </div>
            </div>
            <div className="map-foot">
              <span><Crosshair size={14}/> SELECTED SENSOR: <b>{zone.id}</b></span>
              <span>BASEMAP: TOPOGRAPHIC / DARK</span>
            </div>
          </div>

          {/* Right Column: Zone Intelligence & Gauges */}
          <aside className="intelligence panel">
            <div className="panel-title">
              <span>ZONE INTELLIGENCE</span>
              <span className="mono">{zone.id}</span>
            </div>
            <div className="selected-zone">
              <span>SELECTED ZONE</span>
              <h3>{zone.name}</h3>
              <p>{zone.region} · {zone.coords}</p>
            </div>
            <div className="live-analysis">
              <div className="live-analysis-title">
                <span>LEWS LOCATION ANALYSIS</span>
                <strong>{demoMode?"DEMO":"NASA EONET"}</strong>
              </div>
              <div className="analysis-grid">
                <span>LAT / LONG<b>{analysisPoint.latitude.toFixed(4)}, {analysisPoint.longitude.toFixed(4)}</b></span>
                <span>RECENT ACTIVITY<b>{demoMode?zone.tier:recentEvents.length>3?"HIGH":"MODERATE"}</b></span>
                <span>NEAREST REPORTED EVENT<b>{nearestEvent.event?`${nearestEvent.distance.toFixed(0)} km`:"—"}</b></span>
                <span>LEWS PROTOTYPE RISK SCORE<b style={{color:prototypeRiskColor}}>{prototypeRiskScore} / 100</b></span>
              </div>
              <div className="analysis-source">
                DATA SOURCES <b>{demoMode?"Demonstration dataset · LEWS environmental model":"NASA EONET · LEWS environmental model"}</b><br/>
                LAST UPDATED <b>{liveAvailable&&!demoMode&&liveQuery.data?.updatedAt?new Date(liveQuery.data.updatedAt).toLocaleString("en-GB"):lastUpdate}</b>
              </div>
            </div>
            <div className="risk-block">
              <div className="risk-label">
                <span>LEWS PROTOTYPE RISK SCORE</span>
                <span style={{color:prototypeRiskColor}}>{prototypeRiskLevel}</span>
              </div>
              <div className="gauge">
                <div className="gauge-track">
                  <div className="gauge-fill" style={{width:`${prototypeRiskScore}%`,background:prototypeRiskColor}}/>
                </div>
                <div className="gauge-number">{prototypeRiskScore}<small>/100</small></div>
              </div>
              <div className="advisory" style={{borderColor:prototypeRiskColor}}>
                <span>ADVISORY / {prototypeRiskLevel}</span>
                <p>
                  {prototypeRiskLevel==="LOW"?"Conditions remain within the current monitoring baseline.":prototypeRiskLevel==="MODERATE"?"Conditions are elevated relative to baseline. Continue enhanced monitoring.":prototypeRiskLevel==="HIGH"?"High prototype risk detected. Prepare for possible escalation and review the contributing inputs.":"Critical prototype risk detected. Authority assessment and response procedures should be initiated."}
                </p>
              </div>
            </div>
            <div className="metric-grid">
              <Metric icon={<CloudRain size={15}/>} label="RAINFALL" value={zone.rainfall.toFixed(1)} unit="mm/hr" prev={zone.rainfall-(zone.score%3+.2)} color="#84A6A0"/>
              <Metric icon={<Waves size={15}/>} label="SOIL MOISTURE" value={zone.soil.toFixed(1)} unit="%" prev={zone.soil-(zone.score%2+.5)} color="#D6A24E"/>
              <Metric icon={<Wind size={15}/>} label="SLOPE TILT" value={zone.tilt.toFixed(3)} unit="°/hr" prev={zone.tilt-.002} color="#C28A70"/>
            </div>
            <button className="profile-toggle" onClick={()=>setProfile(!profile)}>
              ZONE PROFILE <ChevronDown size={15} className={profile?"rotate":""}/>
            </button>
            {profile&& (
              <div className="profile">
                <span>ZONE ID <b>{zone.id}</b></span>
                <span>SENSORS <b>{zone.sensors}</b></span>
                <span>BASELINE RISK <b>{zone.baseline}</b></span>
                <span>DATA SOURCE <b>{demoMode?"SIMULATED":liveAvailable?"NASA EONET":"FALLBACK"}</b></span>
              </div>
            )}
          </aside>
        </div>

        {/* Lower Telemetry & Explainability Grid */}
        <div className="lower-grid">
          <div className="chart-panel panel">
            <div className="panel-title">
              <span>RISK SCORE — LAST 16 READINGS</span>
              <span className="trend"><ArrowUpRight size={14}/> TREND {delta(prototypeRiskScore,zone.history[zone.history.length-2])}</span>
            </div>
            <TrendChart values={zone.history} tier={prototypeTier}/>
            <div className="chart-stats">
              <span>CURRENT <b>{prototypeRiskScore}</b></span>
              <span>PREVIOUS <b>{zone.history[zone.history.length-2]}</b></span>
              <span>RECENT HIGH <b>{Math.max(...zone.history)}</b></span>
              <span>STATUS <b style={{color:prototypeRiskColor}}>{prototypeRiskLevel}</b></span>
            </div>
          </div>

          <div className="explain panel">
            <div className="panel-title">
              <span>WHY THIS SCORE?</span>
              <span className="mono">PROTOTYPE RISK CONTRIBUTION</span>
            </div>
            <p>Risk is <b style={{color:prototypeRiskColor}}>{prototypeRiskLevel}</b> because the backend prototype engine combines four transparent inputs:</p>
            <ul>
              <li>{reason}</li>
              <li>{zone.soil>70?"Moisture is elevated relative to baseline.":"Moisture remains below saturation threshold."}</li>
              <li>{zone.tilt>.08?"Tilt signal is above local baseline.":"Tilt is within normal drift range."}</li>
            </ul>
            <div className="contributions">
              {[
                ["RAINFALL INPUT",riskInputs.rainfallScore,"#84A6A0"],
                ["TERRAIN / TILT INPUT",riskInputs.terrainScore,"#C28A70"],
                ["HISTORICAL LANDSLIDE CONTEXT",riskInputs.historicalLandslideScore,"#D6A24E"],
                ["RECENT EVENT CONTEXT",riskInputs.recentEventScore,"#C24B3F"]
              ].map(([label,val,color])=>(
                <div className="contrib" key={label as string}>
                  <span>{label as string}<b>{Math.round((val as number)/4)} / 100</b></span>
                  <i><em style={{width:`${val as number}%`,background:color as string}}/></i>
                </div>
              ))}
            </div>
          </div>

          <div className="history panel">
            <div className="panel-title">
              <span>SENSOR HISTORY</span>
              <span className="mono">LAST 10</span>
            </div>
            <div className="history-head">
              <span>TIME</span><span>RAIN</span><span>MOISTURE</span><span>TILT</span>
            </div>
            {zone.history.slice(-5).reverse().map((v,i)=>(
              <div className="history-row" key={`${v}-${i}`}>
                <span>{i===0?lastUpdate:`${lastUpdate.slice(0,5)}:${String(Math.max(0,38-i*2)).padStart(2,"0")}`}</span>
                <span>{(zone.rainfall-(4-i)*.7).toFixed(1)}</span>
                <span>{(zone.soil-(4-i)*1.1).toFixed(1)}%</span>
                <span>{(zone.tilt-(4-i)*.002).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Support & Executive Operations Suite */}
        <section className="operations-addendum">
          <div className="section-coordinate">DECISION SUPPORT / 06</div>
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="rule"/> DECISION SUPPORT / 06</div>
              <h2>From warning <em>to response.</em></h2>
            </div>
            <p>Compact intelligence modules turn current telemetry into an actionable operating picture.</p>
          </div>

          <div className="ops-grid">
            {/* AI Risk Intelligence */}
            <div className="ai-risk-card panel">
              <div className="panel-title">
                <span><Activity size={14}/> AI RISK INTELLIGENCE</span>
                <span className="mono">{aiAnalysisMutation.data?.provider??"READY TO ANALYZE"}</span>
              </div>
              <div className="ai-risk-head">
                <div>
                  <span className="ai-kicker">AI-GENERATED INTERPRETATION BASED ON AVAILABLE LEWS DATA / {notificationLanguages.find(item=>item.code===language)?.nativeLabel}</span>
                  <h3>{aiAnalysisMutation.data?.assessment??"Run an analysis to explain the current deterministic risk score."}</h3>
                </div>
                <button className="button primary" onClick={runAiAnalysis} disabled={aiAnalysisMutation.isPending}>
                  {aiAnalysisMutation.isPending?"ANALYZING…":"ANALYZE CURRENT STATE"}
                </button>
              </div>
              {aiAnalysisMutation.data?.status==="INSUFFICIENT_DATA"&&(
                <div className="ai-empty">Insufficient real-time data available for reliable AI analysis.</div>
              )}
              {aiAnalysisMutation.data&&(
                <>
                  <div className="ai-meta">
                    <span>RISK LEVEL <b style={{color:prototypeRiskColor}}>{aiAnalysisMutation.data.riskLevel}</b></span>
                    <span>CONFIDENCE <b>{aiAnalysisMutation.data.confidence}</b></span>
                    <span>ANALYSIS TIME <b>{new Date(aiAnalysisMutation.data.generatedAt).toLocaleTimeString("en-GB",{hour12:false})}</b></span>
                  </div>
                  <div className="ai-columns">
                    <div>
                      <span className="ai-label">WHY THIS LEVEL</span>
                      <p>{aiAnalysisMutation.data.why}</p>
                      <span className="ai-label">MAIN CONTRIBUTING FACTORS</span>
                      <ul>
                        {aiAnalysisMutation.data.factors.map((factor,index)=>(
                          <li key={`${factor}-${index}`}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="ai-label">RECOMMENDED SAFETY ACTIONS</span>
                      <ul>
                        {aiAnalysisMutation.data.actions.map((action,index)=>(
                          <li key={`${action}-${index}`}>{action}</li>
                        ))}
                      </ul>
                      <div className="ai-warning">
                        <ShieldAlert size={14}/>
                        <span>{aiAnalysisMutation.data.warning}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Executive Situation Summary */}
            <div className="impact-card panel">
              <div className="panel-title">
                <span><Users size={14}/> EXECUTIVE SITUATION SUMMARY</span>
                <span className="mono">{responsePriority}</span>
              </div>
              <div className="impact-metrics">
                <span><b style={{color:prototypeRiskColor}}>{prototypeRiskLevel}</b><small>SELECTED RISK</small></span>
                <span><b>{exposure.toLocaleString()}</b><small>POPULATION EXPOSURE*</small></span>
                <span><b>{roadRows.filter(r=>r.status==="AT RISK"||r.status==="BLOCKED").length}</b><small>ROADS TO REVIEW</small></span>
                <span><b>{responsePriority}</b><small>RESPONSE LEVEL</small></span>
              </div>
              <div className="impact-list">
                <span><MapPinned size={13}/> VILLAGES POTENTIALLY AFFECTED <b>{prototypeRiskScore>=76?3:prototypeRiskScore>=51?2:1}</b></span>
                <span><Hospital size={13}/> EMERGENCY ACCESS <b>{prototypeRiskScore>=76?"LIMITED":"AVAILABLE"}</b></span>
                <span><Route size={13}/> ALTERNATIVE ROUTE <b>{prototypeRiskScore>=76?"REVIEW REQUIRED":"AVAILABLE"}</b></span>
              </div>
              <small className="impact-disclaimer">* Prototype exposure estimate for demonstration only. Validate with approved population datasets.</small>
            </div>

            {/* Road Corridor Connectivity */}
            <div className="road-card panel">
              <div className="panel-title">
                <span><Route size={14}/> ROAD CONNECTIVITY INTELLIGENCE</span>
                <span className="mono">PROTOTYPE</span>
              </div>
              <p className="module-intro">Smart road status is inferred from the prototype risk surface.</p>
              {roadRows.map(row=>(
                <div className="road-row" key={row.name}>
                  <div>
                    <b>{row.name}</b>
                    <small>{row.distance} from selected risk surface · {row.villages} village(s)</small>
                  </div>
                  <span className={`road-status road-${row.status.toLowerCase().replace(" ","-")}`}>{row.status}</span>
                  <em>CONFIDENCE {row.confidence}</em>
                </div>
              ))}
              <div className="road-recommendation">
                <ShieldCheck size={14}/>
                <span>
                  <b>AI-ASSISTED RECOMMENDATION:</b> {prototypeRiskScore>=76?"Prepare diversion routes and notify district response teams.":prototypeRiskScore>=51?"Monitor vulnerable corridors and review alternative access.":"Continue baseline monitoring; no proactive closure indicated."}
                </span>
              </div>
            </div>

            {/* Weather-Linked Forecast */}
            <div className="forecast-card panel">
              <div className="panel-title">
                <span><CloudRain size={14}/> WEATHER-LINKED RISK FORECAST</span>
                <span className="mono">PROTOTYPE</span>
              </div>
              <div className="forecast-list">
                {forecast.map(item=>(
                  <div className="forecast-row" key={item.time}>
                    <span>{item.time}</span>
                    <b>{item.weather}</b>
                    <strong style={{color:item.score>=76?"#C24B3F":item.score>=51?"#D6A24E":"#6FA377"}}>{classify(item.score)}</strong>
                    <em>{item.score}/100</em>
                  </div>
                ))}
              </div>
              <small className="impact-disclaimer">Forecast values are scenario-derived and not a certified weather forecast.</small>
            </div>

            {/* Citizen & Field Reporting */}
            <div className="report-card panel">
              <div className="panel-title">
                <span><Upload size={14}/> CITIZEN / FIELD REPORTING</span>
                <span className="mono">{reportSaved?"QUEUED":"READY"}</span>
              </div>
              {reportSaved?(
                <div className="report-success">
                  <ShieldCheck size={20}/>
                  <div>
                    <b>REPORT QUEUED FOR HUMAN VERIFICATION</b>
                    <small>Evidence is stored locally in browser storage.</small>
                  </div>
                  <button className="button secondary" onClick={()=>setReportSaved(false)}>NEW REPORT</button>
                </div>
              ):(
                <>
                  <p className="module-intro">Capture slope cracks, movement, landslide activity, or blocked roads.</p>
                  <div className="report-fields">
                    <select value={reportCategory} onChange={e=>setReportCategory(e.target.value)} aria-label="Incident category">
                      <option>SLOPE CRACK</option>
                      <option>LANDSLIDE ACTIVITY</option>
                      <option>BLOCKED ROAD</option>
                      <option>FLOODING</option>
                      <option>INFRASTRUCTURE DAMAGE</option>
                    </select>
                    <select value={reportSeverity} onChange={e=>setReportSeverity(e.target.value)} aria-label="Incident severity">
                      <option>LOW</option>
                      <option>MEDIUM</option>
                      <option>HIGH</option>
                      <option>CRITICAL</option>
                    </select>
                  </div>
                  <div className="report-media">
                    <label><Upload size={13}/> ATTACH EVIDENCE<input type="file" accept="image/*,video/*" onChange={e=>setReportFile(e.target.files?.[0]??null)} /></label>
                    <button className="button secondary" type="button" onClick={requestReportLocation}><MapPin size={13}/> {reportLocation?"LOCATION ATTACHED":"USE MY LOCATION"}</button>
                  </div>
                  <textarea value={reportDescription} onChange={e=>setReportDescription(e.target.value)} placeholder="Describe observed slope conditions..." rows={3}/>
                  <div className="report-actions">
                    <span>LOCATION: {(reportLocation??analysisPoint).latitude.toFixed(3)}, {(reportLocation??analysisPoint).longitude.toFixed(3)}{reportFile?` · FILE: ${reportFile.name}`:""}</span>
                    <button className="button primary" onClick={submitReport}>QUEUE REPORT <Send size={14}/></button>
                  </div>
                </>
              )}
            </div>

            {/* Contextual AI Assistant */}
            <div className="copilot-card panel">
              <div className="panel-title">
                <span><Activity size={14}/> LEWS AI ASSISTANT</span>
                <span className="mono">{assistantMutation.isPending?"THINKING…":"READY"}</span>
              </div>
              <div className="assistant-box">
                <div className="assistant-input">
                  <input
                    type="text"
                    value={assistantQuery}
                    onChange={e=>setAssistantQuery(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&askAssistant()}
                    placeholder="Ask about slope telemetry, road status, or safety..."
                    aria-label="Assistant query"
                  />
                  <button onClick={askAssistant} disabled={assistantMutation.isPending}><Send size={14}/></button>
                </div>
                {assistantMutation.data&&(
                  <div className="assistant-answer">
                    <p>{assistantMutation.data.answer}</p>
                    <small>AI-GENERATED INTERPRETATION BASED ON AVAILABLE LEWS DATA · {new Date(assistantMutation.data.generatedAt).toLocaleTimeString("en-GB",{hour12:false})}</small>
                  </div>
                )}
              </div>
              <div className="recommendations">
                <b>AI-ASSISTED RECOMMENDATIONS</b>
                <span>Review {roadRows[0].name} before the next heavy-rain window.</span>
                <span>Keep emergency access routes open near {zone.name}.</span>
                <span>Request human verification for any citizen field report.</span>
              </div>
            </div>

            {/* System Health & Language Controls */}
            <div className="health-card panel">
              <div className="panel-title">
                <span><Wifi size={14}/> SYSTEM HEALTH & CONFIGURATION</span>
                <button className="health-toggle" onClick={cycleNetwork} aria-label="Cycle network status">
                  {networkState==="ONLINE"?<Wifi size={13}/>:<WifiOff size={13}/>} {networkState}
                </button>
              </div>
              <div className="health-list">
                <span><i/> PROTOTYPE RISK ENGINE <b>OPERATIONAL</b></span>
                <span><i/> NASA EONET FEED <b>{liveAvailable?"CONNECTED":"FALLBACK"}</b></span>
                <span><i/> GIS CARTOGRAPHIC LAYER <b>ACTIVE</b></span>
                <span><i className={networkState==="OFFLINE MODE"?"offline-dot":""}/> OFFLINE REPORT CACHE <b>READY</b></span>
              </div>
              <div className="health-controls">
                <label>
                  NOTIFICATION LANGUAGE
                  <select value={language} onChange={e=>changeLanguage(e.target.value)}>
                    {notificationLanguages.map(item=>(
                      <option value={item.code} key={item.code}>{item.label} — {item.nativeLabel}</option>
                    ))}
                  </select>
                </label>
                <span>LAST UPDATE <b>{lastUpdate}</b></span>
              </div>
            </div>
          </div>
        </section>

        {/* Simulation Scenario Sandbox & Event Transitions */}
        <section className="scenario-section">
          <div className="section-stamp">LEWS / SCN-02<br/>CONTROLLED EVENT<br/><span>SIMULATION ONLY</span></div>
          <div className="scenario-copy">
            <div className="eyebrow"><span className="rule"/> DEMONSTRATION CONTROL / 02</div>
            <h2>Make the risk <em>change.</em></h2>
            <p>Run a controlled escalation to demonstrate how sensor drift, risk classification, explainability and alert transitions connect in one operating loop.</p>
            <button className="button storm" onClick={runStorm}><Siren size={16}/> RUN STORM SCENARIO</button>
            {storm&&(
              <div className="progress-wrap">
                <div><span>SCENARIO ESCALATION</span><b>T+{Math.round(stormProgress/5)}s / 20s</b></div>
                <i><em style={{width:`${stormProgress}%`}}/></i>
              </div>
            )}
          </div>

          <div className="scenario-controls panel">
            <div className="panel-title"><span>SCENARIO PRESETS</span><span className="mono">{scenario}</span></div>
            <div className="preset-grid">
              <button onClick={()=>setPreset("NORMAL DAY")} className={scenario==="NORMAL DAY"?"chosen":""}><Sprout size={18}/><span>NORMAL DAY<small>Stable gradual movement</small></span></button>
              <button onClick={()=>setPreset("HEAVY RAIN")} className={scenario==="HEAVY RAIN"?"chosen":""}><CloudRain size={18}/><span>HEAVY RAIN<small>Rainfall rises first</small></span></button>
              <button onClick={()=>setPreset("EXTREME SLOPE EVENT")} className={scenario==="EXTREME SLOPE EVENT"?"chosen":""}><Wind size={18}/><span>EXTREME SLOPE EVENT<small>All variables increase</small></span></button>
              <button onClick={reset}><RotateCcw size={18}/><span>RESET SIMULATION<small>Return to baseline</small></span></button>
            </div>
            <div className="timeline">
              <span className="timeline-title">SCENARIO TIMELINE</span>
              {[["T+00:00","NORMAL CONDITIONS"],["T+00:05","RAINFALL INCREASING"],["T+00:09","SOIL MOISTURE RISING"],["T+00:12","WATCH THRESHOLD CROSSED"],["T+00:17","CRITICAL THRESHOLD CROSSED"],["T+00:18","ALERT ENGINE ACTIVATED"]].map(([time,label],i)=>(
                <div className={stormProgress>i*19?"done":""} key={time}>
                  <span>{time}</span><b>{label}</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alert Transitions & Critical Acknowledgment */}
        <section className="response-section">
          <div className="alert-log panel">
            <div className="panel-title"><span>ALERT EVENT LOG</span><span className="mono">TIER TRANSITIONS ONLY</span></div>
            {events.length===0?(
              <div className="empty-log"><Bell size={18}/><span>No tier transitions recorded.<small>Alerts appear when a zone crosses a risk threshold.</small></span></div>
            ):(
              events.map((e,i)=>(
                <div className="event" key={`${e.time}-${i}`}>
                  <time>{e.time}</time>
                  <div><b>{e.zone.toUpperCase()}</b><span>{e.transition}</span></div>
                  <strong style={{color:e.transition.includes("CRITICAL")?"#C24B3F":"#D6A24E"}}>RISK {e.risk}</strong>
                </div>
              ))
            )}
          </div>

          <div className={`critical-card panel ${prototypeRiskLevel==="CRITICAL"?"is-critical":""}`}>
            <div className="panel-title">
              <span><ShieldAlert size={15}/> CRITICAL ALERT EXPERIENCE</span>
              <span className="mono">{ack?"ACKNOWLEDGED":"PENDING"}</span>
            </div>
            {prototypeRiskLevel==="CRITICAL"?(
              <>
                <div className="critical-content">
                  <span>CRITICAL SLOPE CONDITION</span>
                  <h3>{zone.name}</h3>
                  <p>ZONE {zone.id} · PROTOTYPE RISK {prototypeRiskScore} / 100</p>
                  <b>Authority attention recommended.</b>
                </div>
                <div className="critical-actions">
                  <button className="button primary" onClick={()=>setAck(true)}>
                    {ack?<><Check size={15}/> ALERT ACKNOWLEDGED</>:<>ACKNOWLEDGE ALERT</>}
                  </button>
                  <button className="button secondary" onClick={()=>setNotice("Response protocol opened for demonstration.")}>VIEW RESPONSE PROTOCOL</button>
                </div>
              </>
            ):(
              <div className="empty-log"><Gauge size={18}/><span>Critical state not active.<small>Run the storm scenario to exercise the escalation path.</small></span></div>
            )}
          </div>
        </section>
      </main>

      {/* Toast Notification */}
      {notice&&(
        <div className="toast">
          <Check size={15}/>
          {notice}
          <button onClick={()=>setNotice(null)}><X size={14}/></button>
        </div>
      )}
    </div>
  );
}

function Metric({icon,label,value,unit,prev,color}:{icon:React.ReactNode;label:string;value:string;unit:string;prev:number;color:string}){
  const v=Number(value);
  return (
    <div className="metric">
      <div className="metric-label">{icon}{label}</div>
      <div className="metric-value" style={{color}}>{value}<small>{unit}</small></div>
      <div className="metric-delta"><ArrowUpRight size={13}/> {delta(v,prev)}</div>
    </div>
  );
}
