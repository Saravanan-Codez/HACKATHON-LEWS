/* Landsora Critical Landslide Risk Toast Notification System */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface CriticalAlertPayload {
  nodeId: string;
  zoneName: string;
  state?: string;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  rainfall: number;
  soilMoisture: number;
  tiltDegrees: number;
  triggerReason?: string;
  thresholdExceeded?: string;
}

export interface CriticalAlertToast extends CriticalAlertPayload {
  id: string;
  timestamp: string;
  createdAt: number;
  acknowledged: boolean;
}

interface CriticalRiskToastContextType {
  toasts: CriticalAlertToast[];
  alertHistory: CriticalAlertToast[];
  isMuted: boolean;
  toggleMute: () => void;
  triggerCriticalAlert: (payload: CriticalAlertPayload) => void;
  dismissToast: (id: string) => void;
  acknowledgeToast: (id: string) => void;
  clearAllToasts: () => void;
  simulateCriticalAlert: (customZone?: Partial<CriticalAlertPayload>) => void;
}

const CriticalRiskToastContext = createContext<CriticalRiskToastContextType | undefined>(undefined);

// Web Audio API emergency chime synthesizer (no external audio files required)
function playEmergencyChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Tone 1: 880 Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(740, now + 0.18);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Tone 2: 1046.5 Hz (C6) High urgency ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);

    // Auto close context after tones complete
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch (err) {
    // Audio playback may be restricted by browser autoplay policy before user interaction
    console.debug("Emergency audio chime blocked by browser autoplay policy", err);
  }
}

export function CriticalRiskToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<CriticalAlertToast[]>([]);
  const [alertHistory, setAlertHistory] = useState<CriticalAlertToast[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("landsora_alert_sound_muted") === "true";
    } catch {
      return false;
    }
  });

  // Track recent trigger signatures to prevent rapid spam duplicate toasts (within 12 seconds per zone)
  const recentTriggersRef = useRef<Map<string, number>>(new Map());

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("landsora_alert_sound_muted", String(next));
      } catch {}
      return next;
    });
  }, []);

  const triggerCriticalAlert = useCallback(
    (payload: CriticalAlertPayload) => {
      // Only proceed for CRITICAL or HIGH landslide risk tiers
      if (payload.riskLevel !== "CRITICAL" && payload.riskScore < 75) {
        return;
      }

      const dedupeKey = `${payload.nodeId}-${payload.riskLevel}`;
      const lastTriggered = recentTriggersRef.current.get(dedupeKey) || 0;
      const now = Date.now();

      // Deduplicate if triggered for the same node within 12 seconds
      if (now - lastTriggered < 12000) {
        return;
      }
      recentTriggersRef.current.set(dedupeKey, now);

      const timeStr = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const newToast: CriticalAlertToast = {
        ...payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: `${timeStr} IST`,
        createdAt: now,
        acknowledged: false,
        triggerReason:
          payload.triggerReason ||
          `Critical sensor threshold surpassed: ${payload.soilMoisture}% soil saturation & ${payload.tiltDegrees}° displacement at ${payload.zoneName}`,
      };

      // Play emergency chime if sound is enabled
      if (!isMuted) {
        playEmergencyChime();
      }

      // Add to visible toasts (keep max 3 active on screen simultaneously)
      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);
      
      // Append to alert history (keep last 25)
      setAlertHistory((prev) => [newToast, ...prev.slice(0, 24)]);
    },
    [isMuted]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const acknowledgeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, acknowledged: true } : t))
    );
    setAlertHistory((prev) =>
      prev.map((t) => (t.id === id ? { ...t, acknowledged: true } : t))
    );
    // Remove from active screen after short delay
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1200);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const simulateCriticalAlert = useCallback(
    (customZone?: Partial<CriticalAlertPayload>) => {
      const sampleZones: CriticalAlertPayload[] = [
        {
          nodeId: "IDK-01",
          zoneName: "Idukki Hill Tracts",
          state: "Kerala",
          riskScore: 92,
          riskLevel: "CRITICAL",
          rainfall: 38.6,
          soilMoisture: 95.2,
          tiltDegrees: 0.142,
          triggerReason: "Biaxial inclinometer rapid shear strain (0.142°) & severe monsoonal rainfall (38.6mm)",
          thresholdExceeded: "Tilt rate > 0.08°/hr & Soil > 90%",
        },
        {
          nodeId: "WYD-02",
          zoneName: "Wayanad Meppadi Slopes",
          state: "Kerala",
          riskScore: 96,
          riskLevel: "CRITICAL",
          rainfall: 44.2,
          soilMoisture: 97.8,
          tiltDegrees: 0.185,
          triggerReason: "Severe pore-water pressure spike and debris flow warning along Meppadi escarpment",
          thresholdExceeded: "24h Rain > 40mm & Pore Liquefaction",
        },
        {
          nodeId: "KDG-03",
          zoneName: "Kodagu Valley Link",
          state: "Karnataka",
          riskScore: 88,
          riskLevel: "CRITICAL",
          rainfall: 33.5,
          soilMoisture: 94.0,
          tiltDegrees: 0.138,
          triggerReason: "Critical slope creep detected on Kodagu Valley pass corridor",
          thresholdExceeded: "Composite Geotechnical Index > 85%",
        },
      ];

      const selected = customZone
        ? { ...sampleZones[0], ...customZone }
        : sampleZones[Math.floor(Math.random() * sampleZones.length)];

      // Bypass deduplication for explicit simulation requests
      recentTriggersRef.current.delete(`${selected.nodeId}-${selected.riskLevel}`);
      triggerCriticalAlert(selected);
    },
    [triggerCriticalAlert]
  );

  return (
    <CriticalRiskToastContext.Provider
      value={{
        toasts,
        alertHistory,
        isMuted,
        toggleMute,
        triggerCriticalAlert,
        dismissToast,
        acknowledgeToast,
        clearAllToasts,
        simulateCriticalAlert,
      }}
    >
      {children}
    </CriticalRiskToastContext.Provider>
  );
}

export function useCriticalRiskToast() {
  const context = useContext(CriticalRiskToastContext);
  if (!context) {
    throw new Error("useCriticalRiskToast must be used within a CriticalRiskToastProvider");
  }
  return context;
}
