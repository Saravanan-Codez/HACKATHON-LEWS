/* Landsora Console Settings: Operational parameters, language preferences, and cache controls */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Database, Globe2, Radio, Save, Shield, Sliders, Trash2, Wifi } from "lucide-react";
import { getStoredNotificationLanguage, notificationLanguages, saveNotificationLanguage, type NotificationLanguage } from "@/lib/notificationTranslations";
import { clearQueuedReports } from "@/lib/reportQueue";

export default function SettingsPage() {
  const [lang, setLang] = useState<NotificationLanguage>(() => getStoredNotificationLanguage());
  const [pollingInterval, setPollingInterval] = useState("2.5");
  const [defaultZone, setDefaultZone] = useState("KDG-03");
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotificationLanguage(lang);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear all offline citizen reports from local browser storage?")) {
      clearQueuedReports();
      alert("Offline report queue cleared.");
    }
  };

  return (
    <div className="settings-page-shell">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <Link href="/dashboard" className="settings-back-btn">
            <ArrowLeft size={14} />
            <span>RETURN TO FIELD CONSOLE</span>
          </Link>
          <div className="settings-title-block">
            <h2>Console Preferences & Configuration</h2>
            <p>Customize telemetry intervals, regional language synthesis, and local cache controls</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="settings-form">
          {/* Section 1: Language & Notifications */}
          <div className="settings-section panel">
            <div className="panel-title">
              <span><Globe2 size={13} /> REGIONAL LANGUAGE SYNTHESIS</span>
              <span className="mono">LAST-MILE ADVISORIES</span>
            </div>
            <div className="settings-body">
              <div className="settings-row">
                <div>
                  <label htmlFor="default-lang">Default Alert Preview Language</label>
                  <small>Pre-compiled multilingual templates generated during WATCH and CRITICAL tier transitions.</small>
                </div>
                <select
                  id="default-lang"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as NotificationLanguage)}
                  className="settings-select"
                >
                  {notificationLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label} — {l.nativeLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-row">
                <div>
                  <label>Audible Critical Warning Beep</label>
                  <small>Emit browser notification sound when risk escalates past 70/100 threshold.</small>
                </div>
                <input
                  type="checkbox"
                  checked={audioAlerts}
                  onChange={(e) => setAudioAlerts(e.target.checked)}
                  className="settings-checkbox"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sensor & Stream Parameters */}
          <div className="settings-section panel">
            <div className="panel-title">
              <span><Sliders size={13} /> TELEMETRY POLLING & STREAMING</span>
              <span className="mono">IoT BRIDGE</span>
            </div>
            <div className="settings-body">
              <div className="settings-row">
                <div>
                  <label htmlFor="poll-interval">Simulation Pulse Interval</label>
                  <small>Rate of random micro-drift and simulated sensor state updates.</small>
                </div>
                <select
                  id="poll-interval"
                  value={pollingInterval}
                  onChange={(e) => setPollingInterval(e.target.value)}
                  className="settings-select"
                >
                  <option value="1.0">1.0 second (High Frequency)</option>
                  <option value="2.5">2.5 seconds (Standard Console)</option>
                  <option value="5.0">5.0 seconds (Low Bandwidth)</option>
                </select>
              </div>

              <div className="settings-row">
                <div>
                  <label htmlFor="default-zone">Default Focused Field Node</label>
                  <small>Initial sensor zone loaded when opening the dashboard.</small>
                </div>
                <select
                  id="default-zone"
                  value={defaultZone}
                  onChange={(e) => setDefaultZone(e.target.value)}
                  className="settings-select"
                >
                  <option value="CHK-01">Chikkamagaluru (Western Ghats)</option>
                  <option value="KDG-03">Kodagu (Western Ghats)</option>
                  <option value="UKA-02">Uttara Kannada (Western Ghats)</option>
                  <option value="WYD-04">Wayanad (Western Ghats)</option>
                  <option value="NLG-05">Nilgiris (Tamil Nadu)</option>
                  <option value="DJE-06">Darjeeling (Eastern Himalayas)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Offline Data & Local Storage */}
          <div className="settings-section panel">
            <div className="panel-title">
              <span><Database size={13} /> LOCAL STORAGE & OFFLINE CACHE</span>
              <span className="mono">BROWSER QUEUE</span>
            </div>
            <div className="settings-body">
              <div className="settings-row">
                <div>
                  <label>Purge Offline Citizen Incident Queue</label>
                  <small>Clears all locally queued slope observations, photos, and GPS tags stored in this browser.</small>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="button secondary settings-danger-btn"
                >
                  <Trash2 size={13} />
                  <span>CLEAR QUEUE</span>
                </button>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="button primary settings-save-btn">
              <Save size={14} />
              <span>SAVE PREFERENCES</span>
            </button>
            {savedNotice && (
              <span className="settings-saved-indicator">
                <Check size={14} /> Preferences saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
