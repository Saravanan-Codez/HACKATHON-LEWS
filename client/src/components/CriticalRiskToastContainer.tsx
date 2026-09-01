/* Landsora Critical Landslide Risk Toast & Native Push Notification Container */
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  History,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
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
    notificationPermission,
    requestNotificationPermission,
    showPermissionBanner,
    dismissPermissionBanner,
    dismissToast,
    acknowledgeToast,
    clearAllToasts,
    simulateCriticalAlert,
  } = useCriticalRiskToast();

  const [, setLocation] = useLocation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequestingPermission(true);
    try {
      await requestNotificationPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  return (
    <>
      {/* 1. NATIVE BROWSER PUSH NOTIFICATION PERMISSION PROMPT BANNER */}
      {showPermissionBanner && notificationPermission === "default" && (
        <aside
          aria-label="Early warning alert subscription"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[10001] bg-[#141C1E] border-2 border-amber-500/80 rounded-xl p-4 shadow-2xl backdrop-blur-xl text-stone-100 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bell size={18} className="animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-amber-300 font-mono tracking-wide uppercase">
                  Enable Desktop Hazard Alerts
                </h4>
                <button
                  type="button"
                  onClick={dismissPermissionBanner}
                  className="text-stone-400 hover:text-stone-200 p-0.5 rounded"
                  title="Dismiss permission prompt"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[11.5px] text-stone-300 leading-snug mb-3">
                Receive instant sound & push alerts on your desktop or mobile device when pore saturation or tilt rates exceed structural failure limits.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  disabled={isRequestingPermission}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  <Bell size={13} />
                  <span>{isRequestingPermission ? "REQUESTING…" : "ENABLE PUSH ALERTS"}</span>
                </button>
                <button
                  type="button"
                  onClick={dismissPermissionBanner}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors"
                >
                  LATER
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. FLOATING TOAST STACK (Top-Right / Fixed overlay) */}
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
            onOpenAiCompanion={() => {
              setLocation(`/ai-chatbot?zone=${toast.nodeId}`);
              dismissToast(toast.id);
            }}
          />
        ))}
      </div>

      {/* 3. HISTORY MODAL / AUDIT LOG */}
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
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 transition-colors"
                  title="Simulate Critical Sensor Alert"
                >
                  <Zap size={12} />
                  <span>SIMULATE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="text-stone-400 hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alertHistory.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Shield size={32} className="mx-auto mb-2 text-stone-600 opacity-60" />
                  <p className="text-xs font-mono uppercase tracking-wide">
                    NO CRITICAL ALERTS TRIGGERED YET
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Telemetry streams are currently within safe geological stability thresholds.
                  </p>
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
              <span className="text-stone-400 text-[11px] font-mono flex items-center gap-2">
                <span>Audio siren: {isMuted ? "MUTED" : "ACTIVE"}</span>
                <span>·</span>
                <span>
                  Push alerts:{" "}
                  {notificationPermission === "granted"
                    ? "🟢 GRANTED"
                    : notificationPermission === "denied"
                    ? "🔴 BLOCKED"
                    : "🟡 NOT ENABLED"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                {alertHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllToasts}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors"
                  >
                    Clear Active
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono transition-colors"
                >
                  Close
                </button>
              </div>
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
  onOpenAiCompanion,
}: {
  toast: CriticalAlertToast;
  isMuted: boolean;
  onToggleMute: () => void;
  onDismiss: () => void;
  onAcknowledge: () => void;
  onFocusZone: () => void;
  onOpenAiCompanion: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (toast.acknowledged || isPaused) return;

    const interval = 100;
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
          ? "0 10px 30px rgba(16, 185, 129, 0.15)"
          : "0 10px 35px rgba(239, 68, 68, 0.35)",
      }}
    >
      {/* Progress countdown bar */}
      {!toast.acknowledged && (
        <div className="w-full h-1 bg-stone-800/80">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-3.5 sm:p-4">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-500/25 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
              <ShieldAlert size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500 text-white leading-none">
                  {toast.riskLevel} {toast.riskScore}%
                </span>
                <span className="text-xs font-bold text-stone-100 truncate font-mono">
                  {toast.zoneName}
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">
                {toast.nodeId} · {toast.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-stone-400 hover:text-stone-200 p-1 rounded-md hover:bg-stone-800 transition-colors"
              title={isMuted ? "Unmute emergency chime" : "Mute emergency chime"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-amber-400" />}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-stone-400 hover:text-stone-200 p-1 rounded-md hover:bg-stone-800 transition-colors"
              title="Dismiss toast"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Trigger Reason Body */}
        <p className="text-xs text-stone-200 leading-snug mb-3 font-mono bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
          ⚠️ {toast.triggerReason}
        </p>

        {/* Telemetry Metric Pill Row */}
        <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-mono mb-3 text-center">
          <div className="bg-stone-950/70 p-1.5 rounded border border-stone-800">
            <span className="text-stone-400 block text-[8.5px]">RAIN INTENSITY</span>
            <span className="text-blue-300 font-bold">{toast.rainfall} mm/hr</span>
          </div>
          <div className="bg-stone-950/70 p-1.5 rounded border border-stone-800">
            <span className="text-stone-400 block text-[8.5px]">SOIL PORE SAT</span>
            <span className="text-amber-300 font-bold">{toast.soilMoisture}%</span>
          </div>
          <div className="bg-stone-950/70 p-1.5 rounded border border-stone-800">
            <span className="text-stone-400 block text-[8.5px]">SLOPE TILT</span>
            <span className="text-purple-300 font-bold">{toast.tiltDegrees}°</span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
          {!toast.acknowledged ? (
            <button
              type="button"
              onClick={onAcknowledge}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] font-mono transition-all shadow-md shadow-red-600/30"
            >
              <Check size={13} />
              <span>ACKNOWLEDGE</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px] font-mono border border-emerald-500/40">
              <Check size={13} />
              <span>ALERT ACKNOWLEDGED</span>
            </div>
          )}

          <button
            type="button"
            onClick={onFocusZone}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-mono transition-colors"
            title="Focus this sector on GIS map"
          >
            <Radio size={12} className="text-cyan-400" />
            <span>GIS MAP</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiCompanion}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-semibold transition-colors"
            title="Ask AI Companion about evacuation"
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
