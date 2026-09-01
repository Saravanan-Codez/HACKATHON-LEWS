/* Landsora Modern High-Precision Marketing & Value Landing Page: 30-40% Streamlined */
import { useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Compass,
  Cpu,
  FileCheck2,
  Gauge,
  Globe2,
  Radio,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  XCircle,
} from "lucide-react";
import ProductPreview from "@/components/landing/ProductPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type LandingLang = "EN" | "HI" | "KN" | "TA" | "TE" | "ML";

const LANDING_LANG_CONFIG: { code: LandingLang; label: string; nativeLabel: string }[] = [
  { code: "EN", label: "English", nativeLabel: "English" },
  { code: "KN", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "TA", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "TE", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "ML", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "HI", label: "Hindi", nativeLabel: "हिन्दी" },
];

export default function LandingPage() {
  const [selectedLandingLang, setSelectedLandingLang] = useState<LandingLang>("EN");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="marketing-landing-page">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="marketing-navbar">
        <div className="marketing-nav-brand">
          <img src="/assets/lews-logo.png" alt="Landsora Contour Logo" className="marketing-nav-logo" />
          <div className="marketing-brand-text">
            <span className="marketing-brand-name">Landsora</span>
            <span className="marketing-brand-sub">LANDSLIDE EARLY WARNING</span>
          </div>
        </div>

        <nav className="marketing-nav-links" aria-label="Main Navigation">
          <button onClick={() => scrollTo("problem")} className="nav-link-btn">Problem</button>
          <button onClick={() => scrollTo("solution")} className="nav-link-btn">Solution</button>
          <button onClick={() => scrollTo("features")} className="nav-link-btn">Capabilities</button>
          <button onClick={() => scrollTo("how-it-works")} className="nav-link-btn">Architecture</button>
          <button onClick={() => scrollTo("faq")} className="nav-link-btn">FAQ</button>
        </nav>

        <div className="marketing-nav-actions">
          {/* Quick Indic Language Ribbon */}
          <div className="landing-lang-strip">
            {LANDING_LANG_CONFIG.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`landing-lang-btn ${selectedLandingLang === l.code ? "active" : ""}`}
                onClick={() => setSelectedLandingLang(l.code)}
                title={`Switch preview to ${l.label} (${l.nativeLabel})`}
              >
                {l.code}
              </button>
            ))}
          </div>

          <Link href="/ai-chatbot" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-amber-300 hover:text-amber-200 font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all">
            <Sparkles size={13} className="text-amber-400" />
            <span>AI Companion</span>
          </Link>

          <Link href="/login" className="nav-auth-link">
            Sign In
          </Link>
          <Link href="/dashboard" className="nav-launch-btn">
            <span>Launch Console</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="marketing-hero">
          <div className="hero-background-art" />
          <div className="hero-content-wrapper">
            <div className="hero-eyebrow">
              <span className="hero-rule" />
              <span>HYPERLOCAL GEOTECHNICAL EARLY WARNING · WESTERN GHATS & HIMALAYAS</span>
            </div>

            <h1 className="hero-main-title">
              Predict slope failure <em>hours before collapse</em> — without blind forecasts.
            </h1>

            <p className="hero-lead-text">
              Broad meteorological alerts arrive too late. <strong>Landsora</strong> continuously monitors soil pore saturation, slope tilt rate, and rainfall telemetry — delivering explainable risk scores and multilingual evacuation advisories to emergency planners and village panchayats.
            </p>

            <div className="hero-cta-group">
              <Link href="/dashboard" className="hero-primary-btn">
                <span>OPEN LIVE FIELD CONSOLE</span>
                <ChevronRight size={16} />
              </Link>
              <button onClick={() => scrollTo("how-it-works")} className="hero-secondary-btn">
                <span>HOW IT WORKS</span>
                <span className="down-arrow">↓</span>
              </button>
            </div>

            {/* Controlled Product Preview */}
            <div className="hero-preview-container">
              <ProductPreview />
            </div>

            {/* Trust Indicators Strip */}
            <div className="hero-trust-strip">
              <div className="trust-item">
                <Radio size={14} className="trust-icon" />
                <span>Live NASA EONET Feeds</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <Cpu size={14} className="trust-icon" />
                <span>4-Factor Risk Engine</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <Globe2 size={14} className="trust-icon" />
                <span>Real-Time Indic Translation</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <FileCheck2 size={14} className="trust-icon" />
                <span>Open Source (MIT)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOCIAL PROOF & METRICS */}
        <section className="marketing-metrics-strip" aria-label="Key telemetry benchmarks">
          <div className="metric-col">
            <strong>12</strong>
            <span>MONITORED MOUNTAIN<br />STATIONS</span>
            <small>Western Ghats & Himalayas</small>
          </div>
          <div className="metric-col">
            <strong>3–6 HRS</strong>
            <span>PROACTIVE WARNING<br />LEAD TIME</span>
            <small>Before catastrophic mass movement</small>
          </div>
          <div className="metric-col">
            <strong>06</strong>
            <span>NATIVE INDIC<br />LANGUAGES</span>
            <small>Kannada, Tamil, Telugu, Malayalam, Hindi, English</small>
          </div>
          <div className="metric-col highlight-col">
            <strong>&lt; 2.5s</strong>
            <span>TELEMETRY STREAM<br />UPDATE LATENCY</span>
            <small>Continuous pore-moisture and tilt ingestion</small>
          </div>
        </section>

        {/* 4. THE PROBLEM STATEMENT */}
        <section id="problem" className="marketing-section problem-dark-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>THE CHALLENGE / 01</span>
            </div>

            <h2 className="section-title">
              District forecasts warn everyone,<br />
              <em>but protect no single slope.</em>
            </h2>

            <p className="section-subtitle">
              Monsoon rain alerts cover thousands of square kilometers. But slopes fail because of pore-water pressure, steep geology, and sudden saturation on specific hillsides.
            </p>

            <div className="problem-cards-grid">
              <div className="problem-card">
                <div className="problem-card-icon red-tint"><AlertTriangle size={20} /></div>
                <h3>Blind District Bulletins</h3>
                <p>
                  Broad district rain warnings cannot pinpoint which mountain road or hillside village is saturated to structural failure.
                </p>
                <span className="problem-card-cost">RESULT: Delayed evacuations or false-alarm complacency</span>
              </div>

              <div className="problem-card">
                <div className="problem-card-icon amber-tint"><ClockHistoryIcon /></div>
                <h3>Post-Disaster Alerts</h3>
                <p>
                  Without real-time tilt and moisture telemetry, official incident reports are filed only after debris blocks highways.
                </p>
                <span className="problem-card-cost">RESULT: Trapped vehicles and severed emergency corridors</span>
              </div>

              <div className="problem-card">
                <div className="problem-card-icon teal-tint"><Globe2 size={20} /></div>
                <h3>Language Inequity</h3>
                <p>
                  English or formal administrative Hindi advisories often fail to reach local village panchayats in time.
                </p>
                <span className="problem-card-cost">RESULT: Critical warnings misunderstood or ignored</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SHOW THE REAL COST (CONSEQUENCE & COMPARISON) */}
        <section className="marketing-section cost-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>EARLY WARNING IMPACT / 02</span>
            </div>

            <h2 className="section-title">
              What a 3-hour lead time changes.
            </h2>

            <div className="comparison-table-wrapper">
              <div className="comparison-col traditional-col">
                <div className="comparison-col-header">
                  <XCircle size={18} className="text-red-400" />
                  <span>TRADITIONAL DISTRICT FORECASTS</span>
                </div>
                <div className="comparison-steps">
                  <div className="step-item">
                    <span className="step-num">01</span>
                    <div>
                      <b>Broad Rain Advisory</b>
                      <p>Warning covers 3,000 km² without slope-specific pore data.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">02</span>
                    <div>
                      <b>Uncertainty & Paralysis</b>
                      <p>Responders cannot determine which mountain pass to close.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">03</span>
                    <div>
                      <b>Sudden Corridor Collapse</b>
                      <p>Slope liquefies, stranding traffic along vulnerable cliffs.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">04</span>
                    <div>
                      <b>Blind Night Rescues</b>
                      <p>Emergency teams operate amidst active rockfall and debris.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="comparison-col lews-col">
                <div className="comparison-col-header">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>WITH Landsora FIELD CONSOLE</span>
                </div>
                <div className="comparison-steps">
                  <div className="step-item">
                    <span className="step-num">01</span>
                    <div>
                      <b>Continuous Pore Saturation Telemetry</b>
                      <p>Sensor stream measures real-time moisture % and angular displacement.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">02</span>
                    <div>
                      <b>Explainable WATCH Alert</b>
                      <p>Score crosses 40/100; factors clearly breakdown rainfall and tilt rates.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">03</span>
                    <div>
                      <b>Multilingual Alert & Diversion Ready</b>
                      <p>Native Kannada/Tamil/Malayalam alerts dispatched; detour routes opened.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">04</span>
                    <div>
                      <b>Pre-Collapse Evacuation</b>
                      <p>Villagers moved to safety hours before debris reaches the corridor.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. INTRODUCE THE SOLUTION & VALUE PROPOSITION */}
        <section id="solution" className="marketing-section solution-overview-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>THE PLATFORM / 03</span>
            </div>

            <h2 className="section-title">
              Precision geotechnical telemetry,<br />
              <em>engineered for fast decisions.</em>
            </h2>

            <div className="solution-pillars-grid">
              <div className="pillar-item">
                <div className="pillar-num">01</div>
                <h3>Deterministic Risk Scoring</h3>
                <p>
                  Zero black-box ambiguity. Transparently weights rainfall rate, slope tilt, soil moisture, and historical baseline so officials can audit every threshold.
                </p>
              </div>

              <div className="pillar-item">
                <div className="pillar-num">02</div>
                <h3>Real-Time Regional Translation</h3>
                <p>
                  High-speed Google Translate integration turns emergency bulletins into native Kannada, Tamil, Telugu, Malayalam, and Hindi instantly.
                </p>
              </div>

              <div className="pillar-item">
                <div className="pillar-num">03</div>
                <h3>Offline Incident Queue</h3>
                <p>
                  First responders log tension cracks and GPS photos locally even when heavy storms knock out cellular towers and power grids.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FEATURES */}
        <section id="features" className="marketing-section features-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>CAPABILITIES / 04</span>
            </div>

            <h2 className="section-title">
              Built for high-stakes terrain.
            </h2>

            <div className="feature-showcase-grid">
              <div className="feature-card">
                <div className="feature-card-header">
                  <Gauge size={22} className="text-amber-400" />
                  <span className="feature-tag">CORE ENGINE</span>
                </div>
                <h3>Multi-Factor Risk Assessment</h3>
                <p>
                  Combines normalized rainfall (mm/hr), tilt rate (°/hr), soil saturation (%), and zone baseline into an accountable 0–100 score classified into STABLE, WATCH, or CRITICAL tiers.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-header">
                  <Compass size={22} className="text-emerald-400" />
                  <span className="feature-tag">GEOSPATIAL</span>
                </div>
                <h3>Interactive GIS Map & NASA Ingestion</h3>
                <p>
                  Navigatable multi-layer terrain map with satellite imagery, topographic contours, live station halos, and geo-referenced NASA EONET disaster feeds.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-header">
                  <Route size={22} className="text-cyan-400" />
                  <span className="feature-tag">LOGISTICS</span>
                </div>
                <h3>Mountain Pass Vulnerability & Diversions</h3>
                <p>
                  Monitors key mountain arteries (NH 10, Charmadi, Wayanad Pass) with population exposure metrics and automated diversion advisories.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-header">
                  <Sparkles size={22} className="text-amber-300" />
                  <span className="feature-tag">DECISION SUPPORT</span>
                </div>
                <h3>Geotechnical Copilot & Diagnostics</h3>
                <p>
                  Synthesizes sensor anomalies into clear operational summaries, explaining primary failure drivers and prioritized safety actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. HOW IT WORKS */}
        <section id="how-it-works" className="marketing-section how-it-works-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>WORKFLOW / 05</span>
            </div>

            <h2 className="section-title">
              From hillside sensor to village safety.
            </h2>

            <div className="workflow-steps-grid">
              <div className="workflow-card">
                <div className="workflow-num">01</div>
                <div className="workflow-icon"><Radio size={20} /></div>
                <h3>SENSE</h3>
                <p>IoT nodes capture rainfall (mm), soil moisture (%), and MEMS tilt (°) in real time.</p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">02</div>
                <div className="workflow-icon"><Cpu size={20} /></div>
                <h3>ANALYZE</h3>
                <p>Deterministic engine computes a transparent 0–100 risk score against geological baselines.</p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">03</div>
                <div className="workflow-icon"><Sparkles size={20} /></div>
                <h3>TRANSLATE</h3>
                <p>Google Translate delivers instant localized Indic bulletins and evacuation routes.</p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">04</div>
                <div className="workflow-icon"><ShieldAlert size={20} /></div>
                <h3>PROTECT</h3>
                <p>Authorities confirm evacuations and close hazardous mountain passes before collapse.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FAQ SECTION */}
        <section id="faq" className="marketing-section faq-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>FAQ / 06</span>
            </div>

            <h2 className="section-title">
              Frequently Asked Questions.
            </h2>

            <div className="faq-layout-grid">
              <Accordion type="single" collapsible className="marketing-faq-accordion">
                <AccordionItem value="what-is-lews" className="faq-acc-item">
                  <AccordionTrigger>What is Landsora and who is it designed for?</AccordionTrigger>
                  <AccordionContent>
                    Landsora is a geotechnical decision-support system built for disaster management authorities (NDMA/SDMA), district control rooms, village panchayats, and field engineers to monitor slopes and coordinate evacuations.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-is-risk-calculated" className="faq-acc-item">
                  <AccordionTrigger>How is the 0–100 risk score calculated?</AccordionTrigger>
                  <AccordionContent>
                    The score transparently weights 40% Rainfall Intensity, 35% Soil Moisture Saturation, 25% Slope Tilt Rate, adjusted by geological baseline. Scores above 40 enter WATCH; scores above 70 escalate to CRITICAL.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-does-offline-work" className="faq-acc-item">
                  <AccordionTrigger>How does offline citizen reporting work?</AccordionTrigger>
                  <AccordionContent>
                    Field reports and photos are queued securely in browser storage during network blackouts and synced automatically once internet connectivity resumes.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hardware-connection" className="faq-acc-item">
                  <AccordionTrigger>Can it connect to real physical sensors?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Landsora includes production-ready ESP32 firmware and a secure HTTP/MQTT telemetry ingestion endpoint (<code>POST /api/telemetry/ingest</code>) for MPU6050 tilt probes, rain gauges, and capacitive soil sensors.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="faq-sidebar-note">
                <div className="sidebar-note-header">
                  <Shield size={16} className="text-amber-400" />
                  <span>TRANSPARENCY GUARANTEE</span>
                </div>
                <p>
                  Every measurement, formula, and sensor reading in Landsora is mathematically auditable. The system never conceals data limits or hallucinates safety margins.
                </p>
                <Link href="/dashboard" className="sidebar-explore-btn">
                  <span>Open Field Console</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FINAL CONVERSION CTA */}
        <section className="marketing-section final-cta-section">
          <div className="section-container">
            <div className="final-cta-card">
              <div className="final-cta-copy">
                <div className="section-kicker">
                  <span className="kicker-rule" />
                  <span>DEPLOY THE CONSOLE / 07</span>
                </div>
                <h2>
                  Turn Hyperlocal Telemetry Into<br />
                  <em>Immediate Life-Saving Action.</em>
                </h2>
                <p>
                  Launch the live Surveyor'''s Field Console, explore monitored mountain stations, and test real-time disaster decision support.
                </p>
                <div className="final-cta-actions">
                  <Link href="/dashboard" className="cta-btn-primary">
                    <span>LAUNCH LIVE FIELD CONSOLE</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/signup" className="cta-btn-secondary">
                    <span>OBSERVER ACCESS</span>
                  </Link>
                </div>
              </div>
              <div className="final-cta-badge">
                <img src="/assets/lews-logo.png" alt="Landsora contour mark" />
                <span>SYSTEM ONLINE · 12 STATIONS</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 11. FOOTER */}
      <footer className="marketing-footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <img src="/assets/lews-logo.png" alt="Landsora logo" />
              <div>
                <strong>Landsora</strong>
                <span>LANDSLIDE EARLY WARNING SYSTEM</span>
              </div>
            </div>
            <p>
              Hyperlocal geological monitoring and disaster decision support console for vulnerable mountain corridors and hillside communities.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4>CONSOLE</h4>
            <Link href="/dashboard">Field Console</Link>
            <Link href="/ai-chatbot">AI Companion</Link>
            <button onClick={() => scrollTo("features")}>Capabilities</button>
            <button onClick={() => scrollTo("faq")}>FAQ</button>
          </div>

          <div className="footer-nav-col">
            <h4>INTEGRATIONS</h4>
            <a href="https://eonet.gsfc.nasa.gov/docs/v3" target="_blank" rel="noreferrer">
              NASA EONET v3
            </a>
            <Link href="/settings">Hardware Telemetry API</Link>
            <Link href="/login">Officer Sign In</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>MIT LICENSE · COPYRIGHT © 2026 LANDSORA LEWS</span>
          <span className="footer-disclaimer-tag">DECISION SUPPORT CONSOLE — NOT AN OFFICIAL BULLETIN</span>
        </div>
      </footer>
    </div>
  );
}

function ClockHistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
