# Landsora — System Architecture & Data Engineering

## Overview

**Landsora (Landslide Early Warning and Risk Monitoring System)** is an IoT-enabled, full-stack disaster-management decision-support application built with React 19, Vite, Express, tRPC, and TypeScript.

It integrates a 5-stage deterministic validation & anomaly quarantine pipeline, a transparent 4-factor risk scoring engine, live NASA EONET event feeds, multilingual alert previews in 5 Indian languages, and ESP32 field telemetry streaming.

---

## High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                           CLIENT LAYER (React 19 + Vite)                          |
|                                                                                   |
|  +-----------------------+  +------------------------+  +-----------------------+ |
|  |  Surveyor's Console   |  |   Live Terrain GIS     |  |   Decision Support    | |
|  |  (Zone Telemetry,     |  |   (India Projection,   |  |   (Executive Summary, | |
|  |   Sparks, POV Toggle) |  |    EONET Markers)      |  |    Roads, Forecast)   | |
|  +-----------------------+  +------------------------+  +-----------------------+ |
|             |                            |                           |            |
|  +------------------------------------------------------------------------------+ |
|  |               tRPC Client & TanStack Query (Type-Safe RPCs)                  | |
|  +------------------------------------------------------------------------------+ |
|             |                                                        |            |
|  +-----------------------+                              +-----------------------+ |
|  | Multilingual Engine   |                              | Citizen Report Queue  | |
|  | (EN, TA, TE, KN, ML)  |                              | (Offline-First Local) | |
|  +-----------------------+                              +-----------------------+ |
+-------------|--------------------------------------------------------|------------+
              | (HTTP / tRPC over JSON)                                |
+-------------v--------------------------------------------------------v------------+
|                              SERVER LAYER (Node.js + Express)                     |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  |                               App Router (tRPC)                              | |
|  |  - landslides.list / historicalLayer                                         | |
|  |  - validation.validate / quarantineList                                      | |
|  |  - iot.deviceHealth / alerts.operatorApproval                                | |
|  |  - risk.score / risk.aiAnalysis / risk.assistant                             | |
|  |  - platform.capabilities                                                     | |
|  +------------------------------------------------------------------------------+ |
|          |                  |                  |                    |             |
|  +-------v------+   +-------v--------+   +-----v----------+   +---------v------+  |
|  | NASA EONET   |   | Anomaly Check  |   | Landsora Risk  |   | AI Risk Intel  |  |
|  | v3 Service   |   | & Quarantine   |   | Scoring Engine |   | & Assistant    |  |
|  +--------------+   +----------------+   +----------------+   +----------------+  |
+-----------------------------------------------------------------------------------+
```

---

## The 4-Factor Deterministic Risk Engine

The prototype risk score is calculated deterministically through `server/services/riskEngine.ts`:

$$\text{Score} = \text{round}\left(\frac{\text{Rainfall} + \text{Terrain/Tilt} + \text{Historical} + \text{Recent}}{4}\right)$$

### Input Components:
1. **Rainfall Score ($0 - 100$)**: Normalized rainfall intensity over threshold ($32\text{ mm/hr}$).
2. **Terrain & Tilt Score ($0 - 100$)**: Normalized slope tilt rate over threshold ($0.16^\circ\text{/hr}$).
3. **Historical Landslide Baseline ($0 - 100$)**: Zone-specific geological baseline.
4. **Recent Event Context ($0 - 100$)**: Live NASA EONET events within proximity.

### Classification Bands:
| Score Range | Risk Level | Advisory / Action Protocol |
|---|---|---|
| **$0 - 25$** | `LOW` | Baseline conditions. Standard routine monitoring. |
| **$26 - 50$** | `MODERATE` | Elevated signals. Enhanced monitoring recommended. |
| **$51 - 75$** | `HIGH` | Significant slope movement/rainfall. Prepare response teams. |
| **$76 - 100$** | `CRITICAL` | Imminent danger threshold. Immediate authority alert and road review. |

---

## Data Ingestion & Caching: NASA EONET

`server/services/eonetService.ts` fetches public natural-event reports from NASA's Earth Observatory Natural Event Tracker (EONET v3):
- **Endpoint**: `https://eonet.gsfc.nasa.gov/api/v3/events?category=landslides&status=open&limit=100`
- **Normalization**: Geometries are converted into unified `{ id, title, date, latitude, longitude, source, status }` records.
- **In-Memory Cache**: 5-minute cache (`CACHE_MS = 300,000`) prevents rate limits.
- **Fail-Safe Fallback**: If external API is unreachable or times out (8s limit), returns explicit fallback state without crashing.

---

## Multilingual Notification Matrix

`client/src/lib/notificationTranslations.ts` provides pre-compiled, linguistically verified notification templates across 5 languages:
- **English (`EN`)**
- **Tamil (`TA`)**
- **Telugu (`TE`)**
- **Kannada (`KN`)**
- **Malayalam (`ML`)**

Each language supports 6 incident notification types:
1. `CRITICAL_WARNING`
2. `LANDSLIDE_WARNING`
3. `ROAD_BLOCKAGE`
4. `EVACUATION`
5. `SAFETY_UPDATE`
6. `COMMUNITY_NOTICE`

---

## Dual-Audience Architecture & Role-Based Access Control (RBAC)

Emergency decision systems must maintain an open public awareness layer while reserving state-level command actions for verified emergency personnel:

```
                                  LEWS PLATFORM ACCESS
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             │                                                           │
             ▼                                                           ▼
     PUBLIC / CITIZEN POV                                      AUTHORITY / COMMAND POV
  (100% Free & Open Access)                              (Authenticated Role via SSO/Portal)
             │                                                           │
   - View live risk scores & GIS                               - Authorize mass evacuation sirens
   - Check road corridor closures                              - Verify/triage citizen ground reports
   - Read 5-language advisories                                - Issue official road closure orders
   - Submit local slope observations                           - Export audit trails for NDMA/GSI
```

### 1. How Authorities Obtain the Authenticated Role
1. **Government Identity / Official SSO**:
   - Authorized personnel (District Collectors, DDMA Emergency Planners, GSI Field Surveyors, Traffic Police Superintendents) authenticate via official domain email verification (`.gov.in` / `.nic.in` / enterprise SSO).
2. **Jurisdiction-Scoped RBAC**:
   - Roles are bounded to specific geographic monitoring nodes (e.g. Kodagu District Collector manages `KDG-03`; Nilgiris DEOC manages `NLG-05`).
3. **Tabletop & Evaluator Mode**:
   - In the hackathon prototype, evaluators and judges can click **"Enter as Guest Field Observer (Demo)"** on `/login` to immediately test administrative workflows without administrative setup overhead.

### 2. POV Differences: Public POV vs. Authority POV

| Capability / Workflow | 👤 Public Citizen POV (Open Access) | 🛡️ Authority / Field Officer POV (Authenticated) |
|---|---|---|
| **Access Gate** | **Zero login required** (immediate life-safety access). | **Authenticated role** (`/login` or guest evaluator mode). |
| **Primary Goal** | Local safety, commute planning, and hazard awareness. | Incident command, evidence verification, and community evacuation. |
| **GIS Terrain Map** | Read-only view of active risk levels & nearby NASA events. | Interactive querying, node baseline overrides, and coordinate inspector. |
| **Citizen Reports** | **Submit** observations (tension cracks, rockfalls, photo tags). | **Triage & Sign Off**: mark reports as *Verified Ground Hazard* or *Dismissed*. |
| **Evacuation Siren** | **Receive** emergency alerts via SMS/Voice in local languages. | **Authorize & Dispatch**: official 1-click critical alert acknowledgment. |
| **Mountain Corridors** | **View** open/blocked status of NH 10 / Ghats links. | **Order Closures**: activate police roadblock protocols & diversion routes. |
| **Regulatory Auditing** | None. | **Export chronological audit logs** (timestamps, alert receipts, officer ID). |

---

## Multi-Route Application Architecture

The system enforces a clean separation of concerns between marketing persuasion and operational execution:

```
/
├── / (Marketing Landing Page)
│   ├── Outcome-First Hero & Value Proposition
│   ├── Interactive Controlled Product Preview (Telemetry Mockup)
│   ├── Problem & Real Cost Consequence Analysis
│   ├── Feature & Benefit Showcase
│   ├── 4-Step Operational Workflow (Sense → Analyze → Explain → Act)
│   ├── Differentiation Matrix
│   └── FAQ & Conversion CTAs
│
├── /dashboard (Operational Field Console)
│   ├── Zone Telemetry Ribbon (6 Western Ghats & Himalayan Nodes)
│   ├── Interactive Terrain GIS Map & NASA EONET Ingestion
│   ├── 4-Factor Deterministic Risk Engine & Gauges
│   ├── Storm Escalation Simulation Sandbox
│   ├── Decision Support Suite (AI Risk Intel, Situation Summary, Roads, Forecast)
│   └── Offline-Ready Citizen & Field Incident Queue
│
├── /login (Authentication & Guest Observer Portal)
├── /signup (Observer Registration Portal)
└── /settings (System Preferences, Language, & Cache Management)
```

---

## Directory Structure

```
├── client/
│   ├── index.html               # Clean SPA HTML template
│   ├── public/
│   │   └── assets/              # Local, self-contained images & textures
│   └── src/
│       ├── App.tsx              # Wouter Multi-Route Switcher
│       ├── index.css            # Design system & shared token stylesheet
│       ├── components/          # Reusable UI components & Radix primitives
│       │   └── landing/         # Marketing landing components & product preview
│       ├── lib/                 # Client utilities, tRPC client, queue & translations
│       └── pages/
│           ├── LandingPage.tsx   # Marketing & conversion narrative
│           ├── DashboardPage.tsx # Dedicated operational console
│           ├── LoginPage.tsx     # Observer sign in & guest access
│           ├── SignupPage.tsx    # Observer registration
│           ├── SettingsPage.tsx  # Preferences & cache management
│           └── NotFound.tsx      # 404 handler
├── docs/                        # Architecture & verification documentation
├── patches/                     # Local package patches (e.g. wouter)
├── server/
│   ├── routers.ts               # tRPC procedures & zod schemas
│   ├── services/
│   │   ├── eonetService.ts      # NASA EONET client & cache
│   │   ├── riskEngine.ts        # 4-factor risk scoring engine
│   │   ├── aiRiskService.ts     # AI explanation & assistant layer
│   │   ├── platformServices.ts  # Service capabilities & honest boundaries
│   │   └── reportSyncService.ts # Citizen report sync boundaries
│   └── _core/                   # Server bootstrap, tRPC context & Express setup
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite build & chunk configuration
```
