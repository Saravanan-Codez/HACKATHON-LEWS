/* LEWS Controlled Product Preview: Interactive marketing telemetry card for the landing page hero */
import { useState } from "react";
import { Link } from "wouter";
import { Activity, AlertTriangle, ArrowRight, CloudRain, Gauge, Globe2, ShieldAlert, ShieldCheck, Waves, Wind } from "lucide-react";
import { notificationLanguages, renderNotification, type NotificationLanguage } from "@/lib/notificationTranslations";

export default function ProductPreview() {
  const [rainfall, setRainfall] = useState(24.5);
  const [soil, setSoil] = useState(72);
  const [tilt, setTilt] = useState(0.082);
  const [lang, setLang] = useState<NotificationLanguage>("EN");

  // Normalized 4-factor risk calculation for the interactive preview
  const rainScore = Math.min(100, (rainfall / 32) * 100);
  const soilScore = Math.min(100, soil);
  const tiltScore = Math.min(100, (tilt / 0.16) * 100);
  const baseline = 42;
  const score = Math.max(0, Math.min(100, Math.round(0.4 * rainScore + 0.35 * soilScore + 0.25 * tiltScore + baseline * 0.08)));

  const tier = score >= 71 ? "CRITICAL" : score >= 40 ? "WATCH" : "STABLE";
  const tierColor = tier === "CRITICAL" ? "#C24B3F" : tier === "WATCH" ? "#D6A24E" : "#6FA377";

  const notification = renderNotification(
    tier === "CRITICAL" ? "CRITICAL_WARNING" : tier === "WATCH" ? "LANDSLIDE_WARNING" : "SAFETY_UPDATE",
    lang,
    { place: "Kodagu Node 03", road: "NH 10 / Teesta Corridor" }
  );

  return (
    <div className="product-preview-wrapper">
      <div className="preview-window">
        {/* Window Top Bar */}
        <div className="preview-window-header">
          <div className="preview-window-dots">
            <span className="dot dot-red" />
            <span className="dot dot-amber" />
            <span className="dot dot-green" />
          </div>
          <div className="preview-window-title">
            <Activity size={12} className="text-amber-400" />
            <span>LEWS SURROUND TELEMETRY · FIELD NODE KDG-03 (WESTERN GHATS)</span>
          </div>
          <span className="preview-badge">LIVE SIMULATION PREVIEW</span>
        </div>

        {/* Window Body */}
        <div className="preview-grid">
          {/* Left Column: Interactive Telemetry Controls */}
          <div className="preview-panel">
            <div className="preview-panel-header">
              <span>ENVIRONMENTAL STRESS TEST</span>
              <small className="mono">INTERACTIVE SLIDERS</small>
            </div>

            <div className="preview-sliders">
              <div className="slider-group">
                <div className="slider-label">
                  <span><CloudRain size={13} style={{ color: "#84A6A0" }} /> Rainfall Intensity</span>
                  <b>{rainfall.toFixed(1)} mm/hr</b>
                </div>
                <input
                  type="range"
                  min="2"
                  max="34"
                  step="0.5"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  aria-label="Simulate rainfall intensity"
                  className="preview-slider"
                />
              </div>

              <div className="slider-group">
                <div className="slider-label">
                  <span><Waves size={13} style={{ color: "#D6A24E" }} /> Soil Moisture Saturation</span>
                  <b>{soil}%</b>
                </div>
                <input
                  type="range"
                  min="25"
                  max="95"
                  step="1"
                  value={soil}
                  onChange={(e) => setSoil(Number(e.target.value))}
                  aria-label="Simulate soil moisture saturation"
                  className="preview-slider"
                />
              </div>

              <div className="slider-group">
                <div className="slider-label">
                  <span><Wind size={13} style={{ color: "#C28A70" }} /> Slope Tilt Acceleration</span>
                  <b>{tilt.toFixed(3)} °/hr</b>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.14"
                  step="0.002"
                  value={tilt}
                  onChange={(e) => setTilt(Number(e.target.value))}
                  aria-label="Simulate slope tilt rate"
                  className="preview-slider"
                />
              </div>
            </div>

            {/* Cross-section diagram */}
            <div className="slope-schematic">
              <div className="schematic-labels">
                <span>SLOPE STABILITY PROFILE</span>
                <span style={{ color: tierColor }}>{tier} STATE</span>
              </div>
              <div className="schematic-bar">
                <div className="schematic-fill" style={{ width: `${score}%`, background: tierColor }} />
              </div>
              <div className="schematic-meta">
                <span>BASELINE: 42/100</span>
                <span>FAIL THRESHOLD: 71/100</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Risk Engine Output & Multilingual Warning Card */}
          <div className="preview-panel output-panel">
            <div className="preview-panel-header">
              <span>LEWS PROTOTYPE RISK SCORE</span>
              <span className="mono" style={{ color: tierColor }}>{tier}</span>
            </div>

            <div className="preview-score-display">
              <div className="preview-score-number" style={{ color: tierColor }}>
                {score}
                <small>/ 100</small>
              </div>
              <div className="preview-score-meta">
                <strong>{tier === "CRITICAL" ? "IMMINENT ESCALATION" : tier === "WATCH" ? "ENHANCED MONITORING" : "STABLE BASELINE"}</strong>
                <p>
                  {tier === "CRITICAL"
                    ? "Slope moisture and tilt exceed safety margins. Evacuation advisory generated."
                    : tier === "WATCH"
                    ? "Soil saturation approaching critical plasticity limit. Road review recommended."
                    : "Telemetry within seasonal normal drift. Routine continuous monitoring active."}
                </p>
              </div>
            </div>

            {/* Multilingual Notification Preview */}
            <div className="preview-alert-card" style={{ borderColor: tier === "CRITICAL" ? "#8A3C34" : "#3D4846" }}>
              <div className="preview-alert-head">
                <div className="alert-lang-picker">
                  <Globe2 size={13} />
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as NotificationLanguage)}
                    aria-label="Preview alert in regional language"
                  >
                    {notificationLanguages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label} ({l.nativeLabel})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="alert-kind-badge" style={{ color: tierColor }}>
                  {tier === "CRITICAL" ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                  {tier === "CRITICAL" ? "EMERGENCY" : tier === "WATCH" ? "ADVISORY" : "ROUTINE"}
                </span>
              </div>

              <div className="preview-alert-body">
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </div>
            </div>

            {/* Direct CTA into the full dashboard */}
            <Link href="/dashboard" className="preview-cta-btn">
              <span>EXPLORE FULL SURROUND CONSOLE</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
