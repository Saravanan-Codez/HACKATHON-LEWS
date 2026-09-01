/* Landsora Marketing Landing Page: Persuasive, outcome-first sales narrative and trust foundation */
import { useState } from "react";
import { Link } from "wouter";
import ProductPreview from "@/components/landing/ProductPreview";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  CloudRain,
  Compass,
  Cpu,
  FileCheck2,
  Gauge,
  Globe2,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Radio,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Users,
  Waves,
  Wind,
  XCircle,
} from "lucide-react";

import { notificationLanguages, type NotificationLanguage } from "@/lib/notificationTranslations";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"engine" | "alerts" | "roads">("engine");
  const [selectedLandingLang, setSelectedLandingLang] = useState<NotificationLanguage>("EN");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="marketing-shell">
      {/* 1. MARKETING NAVBAR */}
      <header className="marketing-navbar">
        <div className="marketing-nav-brand">
          <img src="/assets/lews-logo.png" alt="Landsora contour mark" className="marketing-nav-logo" />
          <div>
            <div className="marketing-brand-name">Landsora</div>
            <div className="marketing-brand-sub">LANDSLIDE EARLY WARNING SYSTEM</div>
          </div>
        </div>

        <nav className="marketing-nav-links">
          <button onClick={() => scrollTo("problem")} className="nav-link-btn">Problem & Cost</button>
          <button onClick={() => scrollTo("solution")} className="nav-link-btn">Solution</button>
          <button onClick={() => scrollTo("features")} className="nav-link-btn">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="nav-link-btn">How It Works</button>
          <button onClick={() => scrollTo("differentiation")} className="nav-link-btn">Why Landsora</button>
          <button onClick={() => scrollTo("faq")} className="nav-link-btn">FAQ</button>
        </nav>

        <div className="marketing-nav-actions">
          {/* 1-Click Language Switcher */}
          <div className="landing-lang-strip" aria-label="1-Click language selector">
            <Globe2 size={12} className="text-amber-400" />
            {notificationLanguages.map((l) => (
              <button
                key={l.code}
                className={`landing-lang-btn ${selectedLandingLang === l.code ? "active" : ""}`}
                onClick={() => setSelectedLandingLang(l.code)}
                title={`Switch preview to ${l.label} (${l.nativeLabel})`}
              >
                {l.code}
              </button>
            ))}
          </div>

          <Link href="/ai-chatbot" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-amber-300 hover:text-amber-200 font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all">
            <Sparkles size={12} className="text-amber-400" />
            <span>AI Copilot</span>
          </Link>

          <Link href="/login" className="nav-auth-link">
            Sign In
          </Link>
          <Link href="/dashboard" className="nav-launch-btn">
            <span>Launch Field Console</span>
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
              <span>HYPERLOCAL DISASTER DECISION INTELLIGENCE · WESTERN GHATS & HIMALAYAS</span>
            </div>

            <h1 className="hero-main-title">
              Predict slope failure <em>hours before collapse</em> — without blind forecasts or panicked evacuations.
            </h1>

            <p className="hero-lead-text">
              Regional meteorological bulletins alert entire districts too late. <strong>Landsora</strong> monitors specific vulnerable hillsides with continuous soil moisture, slope tilt, and rainfall telemetry — delivering explainable risk scores and multilingual evacuation advisories to emergency planners and village panchayats.
            </p>

            <div className="hero-cta-group">
              <Link href="/dashboard" className="hero-primary-btn">
                <span>OPEN LIVE FIELD CONSOLE</span>
                <ChevronRight size={16} />
              </Link>
              <button onClick={() => scrollTo("how-it-works")} className="hero-secondary-btn">
                <span>SEE HOW IT WORKS</span>
                <span className="down-arrow">↓</span>
              </button>
            </div>

            {/* Controlled Product Preview (Interactive Marketing Telemetry Mockup) */}
            <div className="hero-preview-container">
              <ProductPreview />
            </div>

            {/* Trust Indicators Strip */}
            <div className="hero-trust-strip">
              <div className="trust-item">
                <Radio size={14} className="trust-icon" />
                <span>Live NASA EONET Ingestion</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <Cpu size={14} className="trust-icon" />
                <span>Deterministic 4-Factor Risk Engine</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <Globe2 size={14} className="trust-icon" />
                <span>5 Regional Indian Languages</span>
              </div>
              <div className="trust-separator">/</div>
              <div className="trust-item">
                <FileCheck2 size={14} className="trust-icon" />
                <span>100% Open Source (MIT)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOCIAL PROOF & METRICS */}
        <section className="marketing-metrics-strip" aria-label="Key telemetry benchmarks">
          <div className="metric-col">
            <strong>06</strong>
            <span>ACTIVE HIGH-RISK<br />MONITORED REGIONS</span>
            <small>Western Ghats & Eastern Himalayas</small>
          </div>
          <div className="metric-col">
            <strong>4-FACTOR</strong>
            <span>DETERMINISTIC<br />EXPLAINABILITY ENGINE</span>
            <small>Rainfall + Soil + Tilt + History</small>
          </div>
          <div className="metric-col">
            <strong>05</strong>
            <span>NATIVE REGIONAL<br />ALERT TEMPLATES</span>
            <small>Tamil, Telugu, Kannada, Malayalam, English</small>
          </div>
          <div className="metric-col highlight-col">
            <strong>&lt; 2.5s</strong>
            <span>CONTINUOUS TELEMETRY<br />STREAM REFRESH</span>
            <small>Zero AI hallucination on risk baseline</small>
          </div>
        </section>

        {/* 4. THE PROBLEM STATEMENT */}
        <section id="problem" className="marketing-section problem-dark-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>THE LAST-MILE GAP / 01</span>
            </div>

            <h2 className="section-title">
              Regional forecasts warn everyone,<br />
              <em>but protect no single slope.</em>
            </h2>

            <p className="section-subtitle">
              When heavy monsoon rains arrive, district collectors receive broad weather warnings covering thousands of square kilometers. But slopes fail because of hyperlocal pore pressure, steep topography, and sudden soil saturation on one specific hillside.
            </p>

            <div className="problem-cards-grid">
              <div className="problem-card">
                <div className="problem-card-icon red-tint"><AlertTriangle size={20} /></div>
                <h3>Blind District Bulletins</h3>
                <p>
                  A yellow or orange rain warning covers an entire district. It cannot tell emergency teams which specific road corridor or hillside village is saturated to the point of structural failure.
                </p>
                <span className="problem-card-cost">RESULT: Delayed evacuation or widespread false alarms</span>
              </div>

              <div className="problem-card">
                <div className="problem-card-icon amber-tint"><ClockHistoryIcon /></div>
                <h3>Warnings Arrive Post-Event</h3>
                <p>
                  Without real-time slope tilt and soil saturation telemetry, official incident reports are filed after mudslides block highways and isolate communities.
                </p>
                <span className="problem-card-cost">RESULT: Trapped vehicles and severed emergency access</span>
              </div>

              <div className="problem-card">
                <div className="problem-card-icon teal-tint"><Globe2 size={20} /></div>
                <h3>The Language Barrier</h3>
                <p>
                  Scientific meteorological alerts written in English or formal administrative Hindi fail to reach local panchayats and village residents in their native tongues.
                </p>
                <span className="problem-card-cost">RESULT: Misunderstood severity and ignored advisories</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SHOW THE REAL COST (CONSEQUENCE & COMPARISON) */}
        <section className="marketing-section cost-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>THE REAL COST / 02</span>
            </div>

            <h2 className="section-title">
              What happens when early warning<br />
              <em>is delayed by just 3 hours?</em>
            </h2>

            <div className="comparison-table-wrapper">
              <div className="comparison-col traditional-col">
                <div className="comparison-col-header">
                  <XCircle size={18} className="text-red-400" />
                  <span>TRADITIONAL DISTRICT FORECASTING</span>
                </div>
                <div className="comparison-steps">
                  <div className="step-item">
                    <span className="step-num">01</span>
                    <div>
                      <b>Broad Meteorological Warning Issued</b>
                      <p>Rain warning covers 3,000 sq km. Zero slope-specific saturation data.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">02</span>
                    <div>
                      <b>Uncertainty & Decision Paralysis</b>
                      <p>Responders don't know which pass to close. Traffic continues along vulnerable cliffs.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">03</span>
                    <div>
                      <b>Slope Failure & Corridor Blockage</b>
                      <p>Slope liquefies suddenly. Main highway (NH 10 / Ghats) is blocked without diversion.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">04</span>
                    <div>
                      <b>Emergency Rescue in Severe Storms</b>
                      <p>Ambulances and relief supplies stranded. Operations proceed blind at night.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="comparison-col lews-col">
                <div className="comparison-col-header">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>WITH Landsora HYPERLOCAL FIELD CONSOLE</span>
                </div>
                <div className="comparison-steps">
                  <div className="step-item">
                    <span className="step-num">01</span>
                    <div>
                      <b>Continuous Pore-Moisture & Tilt Telemetry</b>
                      <p>Sensor stream tracks soil saturation % and angular displacement in real time.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">02</span>
                    <div>
                      <b>Explainable Risk Engine Triggers WATCH Tier</b>
                      <p>Score crosses 40/100. AI explains exact rainfall & soil factors clearly.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">03</span>
                    <div>
                      <b>Multilingual Alert & Road Diversion Ready</b>
                      <p>Automated Tamil/Kannada/Malayalam alert dispatched; diversion route activated.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <span className="step-num">04</span>
                    <div>
                      <b>Proactive Evacuation Before Collapse</b>
                      <p>Villagers moved to safety; highway closed before debris reaches the corridor.</p>
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
              <span>THE SOLUTION / 03</span>
            </div>

            <h2 className="section-title">
              Meet Landsora:<br />
              <em>The Surveyor's Field Console.</em>
            </h2>

            <p className="section-subtitle">
              A comprehensive decision-support system that translates complex geotechnical sensors and public satellite data into calm, transparent, and actionable emergency intelligence.
            </p>

            <div className="solution-pillars-grid">
              <div className="pillar-item">
                <div className="pillar-num">01</div>
                <h3>100% Explainable Risk</h3>
                <p>
                  No black-box models. The 0–100 risk score openly weights rainfall intensity, slope tilt rate, soil moisture, and historical baseline so officials can defend every evacuation order.
                </p>
              </div>

              <div className="pillar-item">
                <div className="pillar-num">02</div>
                <h3>Last-Mile Language Equity</h3>
                <p>
                  Pre-compiled and verified incident notifications translate complex geological alerts into Tamil, Telugu, Kannada, Malayalam, and English instantly.
                </p>
              </div>

              <div className="pillar-item">
                <div className="pillar-num">03</div>
                <h3>Offline Citizen Reporting</h3>
                <p>
                  First responders and citizens can snap photos, log tension cracks, and tag GPS coordinates locally even when storms knock out power and cellular coverage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FEATURES + BENEFITS */}
        <section id="features" className="marketing-section features-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>CORE CAPABILITIES / 04</span>
            </div>

            <h2 className="section-title">
              Built for field reality,<br />
              <em>engineered for high stakes.</em>
            </h2>

            <div className="feature-showcase-grid">
              {/* Feature 1 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Gauge size={22} className="text-amber-400" />
                  <span className="feature-tag">DECISION ENGINE</span>
                </div>
                <h3>Transparent 4-Factor Risk Engine</h3>
                <p>
                  Combines normalized rainfall (mm/hr), tilt rate (°/hr), soil saturation (%), and zone baseline into an accountable 0–100 score classified into STABLE, WATCH, or CRITICAL tiers.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Zero AI hallucination on safety-critical calculations; full mathematical auditability for authorities.
                </div>
              </div>

              {/* Feature 2 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Compass size={22} className="text-emerald-400" />
                  <span className="feature-tag">GEOGRAPHIC GIS</span>
                </div>
                <h3>NASA EONET Ingestion & Regional GIS</h3>
                <p>
                  Ingests live reported landslide events from NASA's Earth Observatory Natural Event Tracker (EONET v3), cached for 5 minutes and mapped alongside simulated nodes with custom India projections.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Contextualizes local slope movement against broader regional seismic and monsoon patterns.
                </div>
              </div>

              {/* Feature 3 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Route size={22} className="text-cyan-400" />
                  <span className="feature-tag">OPERATIONAL LOGISTICS</span>
                </div>
                <h3>Smart Road Corridor Connectivity</h3>
                <p>
                  Calculates inferred vulnerability for key mountain arteries (NH 10 / Teesta Corridor, Kodagu Link, Wayanad Pass) with population exposure estimates and diversion routing.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Emergency vehicles avoid hazardous passes before debris blocks the corridor.
                </div>
              </div>

              {/* Feature 4 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Sparkles size={22} className="text-amber-300" />
                  <span className="feature-tag">AI RISK INTELLIGENCE</span>
                </div>
                <h3>Contextual AI Risk Interpretation</h3>
                <p>
                  Translates mathematical score spikes into plain-language summaries detailing why the risk level changed, primary contributing factors, and prioritized safety recommendations.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Non-technical field officers immediately understand what action is required.
                </div>
              </div>

              {/* Feature 5 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Smartphone size={22} className="text-rose-400" />
                  <span className="feature-tag">FIELD REPORTING</span>
                </div>
                <h3>Offline Citizen & Field Incident Queue</h3>
                <p>
                  Enables village observers and patrol units to document tension cracks, slope bulges, or blocked culverts with GPS metadata and photo evidence, stored securely in local browser storage.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Critical ground observations are never lost when mobile towers lose connectivity.
                </div>
              </div>

              {/* Feature 6 */}
              <div className="feature-card">
                <div className="feature-card-header">
                  <Activity size={22} className="text-indigo-400" />
                  <span className="feature-tag">SCENARIO LAB</span>
                </div>
                <h3>Controlled Storm Escalation Sandbox</h3>
                <p>
                  Interactive simulation controls allow teams to rehearse heavy rain and extreme slope failure scenarios, watching sensor thresholds, alert triggers, and acknowledgments in real time.
                </p>
                <div className="feature-benefit-pill">
                  <b>Benefit:</b> Emergency training and tabletop disaster drills without putting live systems at risk.
                </div>
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
              From slope sensor<br />
              <em>to village evacuation.</em>
            </h2>

            <p className="section-subtitle">
              A frictionless 4-step chain designed to convert raw physical signals into life-saving action in seconds.
            </p>

            <div className="workflow-steps-grid">
              <div className="workflow-card">
                <div className="workflow-num">01</div>
                <div className="workflow-icon"><Radio size={20} /></div>
                <h3>SENSE</h3>
                <p>
                  IoT sensor nodes capture rainfall intensity (mm/hr), volumetric soil moisture (%), and slope angular tilt (°/hr) across vulnerable terrain zones.
                </p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">02</div>
                <div className="workflow-icon"><Cpu size={20} /></div>
                <h3>ANALYZE</h3>
                <p>
                  The deterministic risk engine evaluates live signals against historical landslide baseline data to compute an explainable 0–100 score.
                </p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">03</div>
                <div className="workflow-icon"><Sparkles size={20} /></div>
                <h3>EXPLAIN</h3>
                <p>
                  Contextual AI intelligence identifies the leading driver (e.g. soil saturation vs sudden rain burst) and produces plain-language safety actions.
                </p>
              </div>

              <div className="workflow-arrow-divider">→</div>

              <div className="workflow-card">
                <div className="workflow-num">04</div>
                <div className="workflow-icon"><ShieldAlert size={20} /></div>
                <h3>ACT</h3>
                <p>
                  Authorities acknowledge the alert, trigger automated multilingual SMS/voice templates, and activate road diversion protocols.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. DIFFERENTIATION MATRIX */}
        <section id="differentiation" className="marketing-section differentiation-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>COMPARISON / 06</span>
            </div>

            <h2 className="section-title">
              Why Landsora is different.
            </h2>

            <div className="diff-table-container">
              <table className="diff-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Regional Weather Bulletins</th>
                    <th>Industrial SCADA Systems</th>
                    <th className="highlight-header">Landsora Field Console</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Spatial Precision</b></td>
                    <td>District level (2,000+ km²)</td>
                    <td>Single mine / dam site</td>
                    <td className="highlight-cell"><b>Hyperlocal hill / village zone</b></td>
                  </tr>
                  <tr>
                    <td><b>Risk Explainability</b></td>
                    <td>General probability %</td>
                    <td>Raw engineering graphs</td>
                    <td className="highlight-cell"><b>4-factor transparent contribution breakdown</b></td>
                  </tr>
                  <tr>
                    <td><b>Last-Mile Languages</b></td>
                    <td>English / Hindi only</td>
                    <td>English only</td>
                    <td className="highlight-cell"><b>Tamil, Telugu, Kannada, Malayalam, English</b></td>
                  </tr>
                  <tr>
                    <td><b>Citizen Field Reporting</b></td>
                    <td>None</td>
                    <td>None</td>
                    <td className="highlight-cell"><b>Offline GPS + Photo Evidence Queue</b></td>
                  </tr>
                  <tr>
                    <td><b>Road Corridor Routing</b></td>
                    <td>Unlinked</td>
                    <td>Unlinked</td>
                    <td className="highlight-cell"><b>Inferred road status & diversion routing</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 10. FAQ SECTION */}
        <section id="faq" className="marketing-section faq-section">
          <div className="section-container">
            <div className="section-kicker">
              <span className="kicker-rule" />
              <span>FREQUENTLY ASKED QUESTIONS / 07</span>
            </div>

            <h2 className="section-title">
              Clear answers for<br />
              <em>the last mile.</em>
            </h2>

            <div className="faq-layout-grid">
              <Accordion type="single" collapsible className="marketing-faq-accordion">
                <AccordionItem value="what-is-lews" className="faq-acc-item">
                  <AccordionTrigger>What is Landsora and who is it designed for?</AccordionTrigger>
                  <AccordionContent>
                    Landsora (Landslide Early Warning System) is a decision-support prototype built for disaster management authorities (NDMA/SDMA), district emergency operations centers, village panchayats, and geotechnical field researchers. It brings hyperlocal slope telemetry, explainable risk calculations, and evacuation protocols into a single, unified operating console.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="is-it-official" className="faq-acc-item">
                  <AccordionTrigger>Is Landsora an official certified government warning system?</AccordionTrigger>
                  <AccordionContent>
                    No. Landsora is currently an open-source research and decision-support prototype. It is engineered to complement approved regional forecasting frameworks (such as Geological Survey of India / NDMA guidelines) and demonstrate how a hyperlocal last-mile telemetry layer can function. In real emergencies, always follow directives from district administration and emergency services.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-is-risk-calculated" className="faq-acc-item">
                  <AccordionTrigger>How does the deterministic risk engine calculate the 0–100 score?</AccordionTrigger>
                  <AccordionContent>
                    The score is computed deterministically: 40% Rainfall Intensity (normalized over 32 mm/hr), 35% Soil Moisture Saturation (%), 25% Slope Tilt Rate (normalized over 0.16 °/hr), adjusted with a zone-specific geological baseline. If a score exceeds 40, it enters WATCH; above 70, it escalates to CRITICAL.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-does-offline-work" className="faq-acc-item">
                  <AccordionTrigger>How does offline citizen reporting function during network blackouts?</AccordionTrigger>
                  <AccordionContent>
                    The citizen reporting module uses the browser's persistent local storage. If mobile towers or internet backhauls fail, observers can still record GPS coordinates, attach photos, and classify incident severity. The reports are queued locally and preserved until network connectivity is re-established.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data-privacy-and-license" className="faq-acc-item">
                  <AccordionTrigger>What is the software license and how can we deploy it?</AccordionTrigger>
                  <AccordionContent>
                    Landsora is released under the permissive MIT License. You are free to fork the repository, connect custom LoRaWAN/NB-IoT sensor bridges, or integrate regional GIS feeds. Detailed setup instructions for Linux, macOS, and Windows are provided in the repository's README and ARCHITECTURE documentation.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="faq-sidebar-note">
                <div className="sidebar-note-header">
                  <Shield size={16} className="text-amber-400" />
                  <span>TRANSPARENCY GUARANTEE</span>
                </div>
                <p>
                  Every measurement, formula, and source status in Landsora remains visible in the console. The system never conceals data limitations or invents certified predictions.
                </p>
                <Link href="/dashboard" className="sidebar-explore-btn">
                  <span>Open Field Console</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FINAL CONVERSION CTA */}
        <section className="marketing-section final-cta-section">
          <div className="section-container">
            <div className="final-cta-card">
              <div className="final-cta-copy">
                <div className="section-kicker">
                  <span className="kicker-rule" />
                  <span>DEPLOY THE CONSOLE / 08</span>
                </div>
                <h2>
                  Turn Hyperlocal Signals Into<br />
                  <em>Immediate Life-Saving Action.</em>
                </h2>
                <p>
                  Launch the live Surveyor's Field Console, test an escalation scenario, and experience how explainable telemetry protects the last mile.
                </p>
                <div className="final-cta-actions">
                  <Link href="/dashboard" className="cta-btn-primary">
                    <span>LAUNCH LIVE FIELD CONSOLE</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/signup" className="cta-btn-secondary">
                    <span>CREATE FIELD OBSERVER ACCOUNT</span>
                  </Link>
                </div>
              </div>
              <div className="final-cta-badge">
                <img src="/assets/lews-logo.png" alt="Landsora contour mark" />
                <span>SYSTEM ONLINE · VERSION 0.1</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 12. MARKETING FOOTER */}
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
            <div className="footer-author-tag">
              <span>Created by <b>Jai Kishore G.V.</b></span>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>PRODUCT</h4>
            <Link href="/dashboard">Live Field Console</Link>
            <button onClick={() => scrollTo("features")}>Features & Benefits</button>
            <button onClick={() => scrollTo("how-it-works")}>System Architecture</button>
            <button onClick={() => scrollTo("faq")}>FAQ</button>
          </div>

          <div className="footer-nav-col">
            <h4>DEVELOPER & DOCS</h4>
            <a href="https://github.com/Saravanan-Codez/HACKATHON-Landsora" target="_blank" rel="noreferrer">
              GitHub Repository
            </a>
            <a href="https://eonet.gsfc.nasa.gov/docs/v3" target="_blank" rel="noreferrer">
              NASA EONET v3 API
            </a>
            <Link href="/settings">System Settings</Link>
            <Link href="/login">Observer Sign In</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>MIT LICENSE · COPYRIGHT © 2026 JAI KISHORE G.V.</span>
          <span className="footer-disclaimer-tag">SIMULATION & DECISION SUPPORT ONLY — NOT AN OFFICIAL BULLETIN</span>
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
