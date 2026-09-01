/* Landsora Critical Landslide Risk Toast & Real HTML5 Browser Push Notification System */
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

export type BrowserNotificationStatus = "granted" | "denied" | "default" | "unsupported";

interface CriticalRiskToastContextType {
  toasts: CriticalAlertToast[];
  alertHistory: CriticalAlertToast[];
  isMuted: boolean;
  toggleMute: () => void;
  notificationPermission: BrowserNotificationStatus;
  requestNotificationPermission: () => Promise<BrowserNotificationStatus>;
  showPermissionBanner: boolean;
  dismissPermissionBanner: () => void;
  triggerCriticalAlert: (payload: CriticalAlertPayload) => void;
  dismissToast: (id: string) => void;
  acknowledgeToast: (id: string) => void;
  clearAllToasts: () => void;
  simulateCriticalAlert: (customZone?: Partial<CriticalAlertPayload>) => void;
}

const CriticalRiskToastContext = createContext<CriticalRiskToastContextType | undefined>(undefined);

// Web Audio API emergency chime synthesizer
function playEmergencyChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1000);
  } catch (err) {
    console.debug("Emergency audio chime blocked by browser autoplay policy", err);
  }
}

// Native HTML5 Browser Desktop Notification Dispatcher
function sendNativeBrowserNotification(title: string, options: NotificationOptions = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Desktop notifications not supported in this environment");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission is not granted:", Notification.permission);
    return;
  }

  try {
    const notifOptions: NotificationOptions = {
      body: options.body || "Geotechnical early warning alert from Landsora.",
      icon: options.icon || "/assets/lews-logo.png",
      badge: options.badge || "/assets/lews-logo.png",
      tag: options.tag || `landsora-alert-${Date.now()}`,
      requireInteraction: options.requireInteraction ?? true,
      silent: false,
    };

    const notif = new window.Notification(title, notifOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.warn("Standard window.Notification failed, attempting fallback:", err);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.showNotification) {
          reg.showNotification(title, options);
        }
      }).catch(() => {});
    }
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

  // Browser HTML5 Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<BrowserNotificationStatus>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission as BrowserNotificationStatus;
    }
    return "unsupported";
  });

  const [showPermissionBanner, setShowPermissionBanner] = useState<boolean>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted" || Notification.permission === "denied") return false;
    try {
      return localStorage.getItem("landsora_notif_banner_dismissed") !== "true";
    } catch {
      return true;
    }
  });

  // Check and sync permission status on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission as BrowserNotificationStatus);
      if (Notification.permission === "default") {
        const dismissed = localStorage.getItem("landsora_notif_banner_dismissed") === "true";
        if (!dismissed) setShowPermissionBanner(true);
      } else {
        setShowPermissionBanner(false);
      }
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<BrowserNotificationStatus> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      return "unsupported";
    }

    try {
      const result = await Notification.requestPermission();
      const status = result as BrowserNotificationStatus;
      setNotificationPermission(status);
      setShowPermissionBanner(false);
      try {
        localStorage.setItem("landsora_notif_banner_dismissed", "true");
      } catch {}

      if (status === "granted") {
        sendNativeBrowserNotification("🚨 Landsora Early Warning Active", {
          body: "You will now receive real-time slope stability and landslide evacuation alerts even when this tab is minimized.",
          icon: "/assets/lews-logo.png",
          badge: "/assets/lews-logo.png",
          tag: "landsora-permission-welcome",
        });
      }
      return status;
    } catch (err) {
      console.warn("Notification.requestPermission error:", err);
      return (Notification.permission as BrowserNotificationStatus) || "default";
    }
  }, []);

  const dismissPermissionBanner = useCallback(() => {
    setShowPermissionBanner(false);
    try {
      localStorage.setItem("landsora_notif_banner_dismissed", "true");
    } catch {}
  }, []);

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
          `Critical threshold surpassed: ${payload.soilMoisture}% soil saturation & ${payload.tiltDegrees}° displacement at ${payload.zoneName}`,
      };

      // 1. Play emergency audio chime if sound is enabled
      if (!isMuted) {
        playEmergencyChime();
      }

      // 2. Dispatch real native HTML5 browser desktop push notification
      sendNativeBrowserNotification(`🚨 [CRITICAL HAZARD] ${payload.zoneName}`, {
        body:
          payload.triggerReason ||
          `Risk Score ${payload.riskScore}/100 in ${payload.zoneName}. Rain: ${payload.rainfall}mm/hr, Soil: ${payload.soilMoisture}%, Tilt: ${payload.tiltDegrees}°. Immediate safety action advised.`,
        icon: "/assets/lews-logo.png",
        badge: "/assets/lews-logo.png",
        tag: `landsora-alert-${payload.nodeId}`,
        requireInteraction: true,
      });

      // 3. Add to visible toasts (keep max 3 active on screen simultaneously)
      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

      // 4. Append to alert history (keep last 25)
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
          nodeId: "WYD-04",
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
          zoneName: "Kodagu (Coorg)",
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
        notificationPermission,
        requestNotificationPermission,
        showPermissionBanner,
        dismissPermissionBanner,
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
