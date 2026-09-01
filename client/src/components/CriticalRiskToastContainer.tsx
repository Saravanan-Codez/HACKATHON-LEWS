/* Landsora Critical Landslide Risk Toast Notification Container */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bell,
  BellOff,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Compass,
  ExternalLink,
  History,
  Info,
  MapPin,
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import {
  useCriticalRiskToast,
  type CriticalAlertToast,
} from "@/contexts/CriticalRiskToastContext";

export function CriticalRiskToastContainer() {
  const {
    toasts,
    alertHistory,
    isMuted,
    toggleMute,
    dismissToast,
    acknowledgeToast,
    clearAllToasts,
    simulateCriticalAlert,
  } = useCriticalRiskToast();

  const [, setLocation] = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);

  // If no active toasts and history is closed, show only subtle simulator / status widget when hovered or none
  return (
    <>
      {/* 1. FLOATING TOAST STACK (Top-Right / Fixed overlay) */}
      <div
        className="fixed top-18 sm:top-20 right-3 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-24px)] sm:max-w-md w-full"
        aria-live="assertive"
      >
        {toasts.map((toast) => (
          <CriticalToastItem
            key={toast.id}
            toast={toast}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onDismiss={() => dismissToast(toast.id)}
            onAcknowledge={() => acknowledgeToast(toast.id)}
            onFocusZone={() => {
              setLocation(`/dashboard?zone=${toast.nodeId}`);
              dismissToast(toast.id);
            }}
            onOpenAiCopilot={() => {
              setLocation(`/ai-chatbot?zone=${toast.nodeId}`);
              dismissToast(toast.id);
            }}
          />
        ))}
      </div>

      {/* 2. HISTORY MODAL / SLIDE-OVER */}
      {historyOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#172225] border border-stone-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#F4EEDC]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    Critical Landslide Sensor Alert Log
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {alertHistory.length} EVENTS RECORDED
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Real-time audit log of sensor thresholds exceeding critical limits
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => simulateCriticalAlert()}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                  title="Simulate a new critical landslide alert"
                >
                  + TEST TRIGGER
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              {alertHistory.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <ShieldAlert size={36} className="mx-auto text-stone-600 mb-2" />
                  <p className="text-xs font-mono">No critical landslide alerts recorded in this session.</p>
                  <button
                    type="button"
                    onClick={() => simulateCriticalAlert()}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    Simulate Critical Sensor Alert
                  </button>
                </div>
              ) : (
                alertHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.acknowledged
                        ? "bg-stone-900/60 border-stone-800 opacity-80"
                        : "bg-red-950/20 border-red-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-stone-100">
                          {item.zoneName} ({item.nodeId})
                        </span>
                        {item.state && (
                          <span className="text-[10px] font-mono text-stone-400">· {item.state}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-400">{item.timestamp}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            item.acknowledged
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                              : "bg-red-950/60 text-red-300 border-red-500/40"
                          }`}
                        >
                          {item.acknowledged ? "ACKNOWLEDGED" : "PENDING ACK"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 mb-2.5 font-mono">{item.triggerReason}</p>

                    <div className="grid grid-cols-4 gap-2 text-[11px] font-mono bg-stone-950/60 p-2 rounded-lg border border-stone-800">
                      <div>
                        <span className="text-stone-500 block text-[9px]">RAIN</span>
                        <span className="text-blue-400 font-bold">{item.rainfall}mm</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">SOIL</span>
                        <span className="text-amber-400 font-bold">{item.soilMoisture}%</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">TILT</span>
                        <span className="text-purple-400 font-bold">{item.tiltDegrees}°</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px]">RISK</span>
                        <span className="text-red-400 font-bold">{item.riskScore}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px] font-mono">
                Audio siren alerts: {isMuted ? "MUTED" : "ACTIVE"}
              </span>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CriticalToastItem({
  toast,
  isMuted,
  onToggleMute,
  onDismiss,
  onAcknowledge,
  onFocusZone,
  onOpenAiCopilot,
}: {
  toast: CriticalAlertToast;
  isMuted: boolean;
  onToggleMute: () => void;
  onDismiss: () => void;
  onAcknowledge: () => void;
  onFocusZone: () => void;
  onOpenAiCopilot: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-dismiss countdown (14 seconds if not paused/acknowledged)
  useEffect(() => {
    if (toast.acknowledged || isPaused) return;

    const interval = 100; // ms
    const totalMs = 14000;
    const decrement = (interval / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.acknowledged, isPaused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full rounded-xl bg-[#141D20]/95 backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl overflow-hidden ${
        toast.acknowledged
          ? "border-emerald-500/60 bg-[#12221E]/95"
          : "border-red-500/90 shadow-red-950/50 animate-pulse-border"
      }`}
      style={{
        boxShadow: toast.acknowledged
          ? "0 10px 30px rgba(16, 185, 129, 0.2)"
          : "0 12px 35px rgba(194, 75, 63, 0.45)",
      }}
    >
      {/* Progress Bar Header */}
      {!toast.acknowledged && (
        <div className="h-1 w-full bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-3.5 sm:p-4 text-[#F4EEDC]">
        {/* Top Banner Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <AlertOctagon size={16} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-600 text-white tracking-wider">
                  CRITICAL SENSOR ALERT
                </span>
                <span className="text-[10px] font-mono text-red-400 font-semibold">
                  {toast.riskScore}% RISK
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-100 mt-0.5">
                {toast.zoneName} <span className="font-mono text-stone-400 font-normal">({toast.nodeId})</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Mute toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              className="p-1 rounded text-stone-400 hover:text-stone-200 transition-colors"
              title={isMuted ? "Unmute emergency sirens" : "Mute emergency sirens"}
            >
              {isMuted ? <VolumeX size={14} className="text-stone-500" /> : <Volume2 size={14} className="text-amber-400" />}
            </button>
            {/* Close button */}
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded text-stone-400 hover:text-stone-100 transition-colors"
              title="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Reason */}
        <p className="text-[11px] text-stone-300 font-mono leading-relaxed mb-3 bg-stone-900/80 p-2 rounded-lg border border-stone-800">
          ⚠️ {toast.triggerReason}
        </p>

        {/* Live Physical Telemetry Pills */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px] font-mono">
          <div className="bg-stone-950/70 p-1.5 rounded border border-blue-900/40 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1">
              <CloudRain size={11} className="text-blue-400" /> Rain:
            </span>
            <b className="text-blue-300">{toast.rainfall}mm</b>
          </div>

          <div className="bg-stone-950/70 p-1.5 rounded border border-amber-900/40 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1">
              <Activity size={11} className="text-amber-400" /> Soil:
            </span>
            <b className="text-amber-300">{toast.soilMoisture}%</b>
          </div>

          <div className="bg-stone-950/70 p-1.5 rounded border border-purple-900/40 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1">
              <Compass size={11} className="text-purple-400" /> Tilt:
            </span>
            <b className="text-purple-300">{toast.tiltDegrees}°</b>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-stone-800">
          {!toast.acknowledged ? (
            <button
              type="button"
              onClick={onAcknowledge}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <CheckCircle2 size={13} />
              <span>ACKNOWLEDGE</span>
            </button>
          ) : (
            <div className="flex-1 py-1 px-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center justify-center gap-1.5">
              <Check size={12} className="text-emerald-400" />
              <span>ALARM ACKNOWLEDGED</span>
            </div>
          )}

          <button
            type="button"
            onClick={onFocusZone}
            className="py-1.5 px-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono transition-colors flex items-center gap-1 border border-stone-700"
            title="Focus this node in the main telemetry console"
          >
            <MapPin size={12} className="text-amber-400" />
            <span>MAP</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiCopilot}
            className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono font-bold transition-colors flex items-center gap-1 border border-amber-500/40"
            title="Consult Gemini AI geotechnical copilot for this hazard"
          >
            <Bot size={12} className="text-amber-400" />
            <span>COPILOT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
