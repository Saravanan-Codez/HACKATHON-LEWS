# 🧪 06. Simulation Sandbox & Scenario Testing Guide

> **Interactive Disaster Scenarios, Anomaly Injections & Operator Workflows**  
> *A step-by-step test guide for evaluators, hackathon judges, quality assurance engineers, and field operators.*

---

## 🗂️ Table of Contents

1. [Overview of the 7-Scenario Simulation Suite](#1-overview-of-the-7-scenario-simulation-suite)
2. [Step-by-Step Scenario Walkthroughs](#2-step-by-step-scenario-walkthroughs)
3. [Evaluating State Progression in the UI](#3-evaluating-state-progression-in-the-ui)
4. [Automated Verification Test Suite](#4-automated-verification-test-suite)

---

## 1. Overview of the 7-Scenario Simulation Suite

Because actual severe landslides cannot be summoned on command for software testing, Landsora includes an integrated **7-Scenario Simulation Sandbox** on the surveyor console (`/dashboard`).

This allows evaluators and emergency responders to test how the entire system responds to changing weather, hardware glitches, sensor shocks, and mass evacuation triggers with a single click:

| Scenario | Simulated Environmental & Hardware Condition | Expected Risk Score | Anomaly Quarantine State | Primary UI Response |
|---|---|---|---|---|
| **1. Baseline Normal** | Clear weather ($0\text{ mm/hr}$ rain, $35\%$ soil moisture, $0.01^\circ\text{/hr}$ tilt). | **18 / 100 (`LOW`)** | `ACCEPTED` (100% Conf.) | 🟢 Green gauges, calm telemetry pulses. |
| **2. Persistent Rain** | Steady monsoon rain ($14\text{ mm/hr}$, $62\%$ soil saturation). | **42 / 100 (`MODERATE`)** | `ACCEPTED` (95% Conf.) | 🟡 Yellow gauges, culvert monitoring advisory. |
| **3. Extreme Cloudburst**| Violent storm ($38\text{ mm/hr}$, $89\%$ soil saturation, $0.12^\circ\text{/hr}$ tilt). | **84 / 100 (`CRITICAL`)** | `ACCEPTED` (98% Conf.) | 🔴 Red flashing gauges, audible siren, road closures. |
| **4. Tilt Shock Spike** | Mechanical vibration / bird strike ($0.095^\circ$ instant jump). | Clamped to **24 (`LOW`)** | **`QUARANTINED` (-60% Conf.)** | 🛡️ Yellow Quarantine Badge, spike isolated from risk math. |
| **5. Uplink Delay / Stale**| Telemetry delayed by $>30$ minutes due to cell outage. | **Unchanged** | `ACCEPTED_WITH_WARNING` | ⚠️ Latency indicator, timestamp drift warning. |
| **6. Low Battery Mode** | Solar panel covered in mud ($V_{\text{bat}} = 3.18\text{V} < 3.3\text{V}$). | **Unchanged** | `ACCEPTED_WITH_WARNING` | 🪫 Low battery icon, ADC noise warning penalty. |
| **7. Evacuation Broadcast**| Operator triggers 1-click critical siren approval. | **84 (`CRITICAL`)** | Verified & Signed Off | 📢 Delivery receipts, 24 panchayats alerted via SMS. |

---

## 2. Step-by-Step Scenario Walkthroughs

### 🟢 Scenario 1: Baseline Nominal
- **How to Trigger**: Click **"Nominal / Dry"** on the Dashboard Scenario Ribbon.
- **Under the Hood**:
  - Sets rainfall to $0.0\text{ mm/hr}$, soil moisture to $35.0\%$, tilt rate to $0.010^\circ\text{/hr}$.
  - The 4-factor risk calculation evaluates to $\sim 18/100$.
- **Observed Behavior**:
  - Risk gauge displays **LOW** in emerald green.
  - Gemini AI risk assessment reports nominal baseline stability.
  - Interactive GIS map markers glow steady green.

---

### 🔴 Scenario 3: Extreme Storm & Imminent Slope Failure
- **How to Trigger**: Click **"Extreme Storm"** on the Dashboard Sandbox.
- **Under the Hood**:
  - Rainfall surges to $38.4\text{ mm/hr}$, soil moisture crosses the plastic limit to $89.2\%$, inclinometer registers active rotational creep ($0.124^\circ\text{/hr}$).
  - Deterministic risk engine computes a score of **$84/100$ (`CRITICAL`)**.
- **Observed Behavior**:
  - Risk gauge turns vibrant crimson red with a pulsating radar wave.
  - Critical hazard audio chime sounds on the console.
  - A high-priority emergency toast pops up with multilingual alert options.
  - Gemini AI provides an immediate geotechnical assessment: *"Critical slope instability detected. Pore water pressure exceeds shear strength. Initiate evacuation."*
  - Mountain pass road cards (e.g. NH 10 / Charmadi Ghat) switch to **`BLOCKED / AVOID`**.

---

### 🛡️ Scenario 4: Quarantined Mechanical Shock (Bird Strike / Wildlife)
- **How to Trigger**: Click **"Tilt Shock / Spike"** on the Dashboard Sandbox.
- **Under the Hood**:
  - An instantaneous tilt jump of $0.095^\circ$ is injected in a single 2.5s time step without antecedent rainfall.
  - **Stage 3 Validation (`SPIKE-01`)** detects the rate-of-change violation ($>0.08^\circ/\text{sample}$).
  - Confidence score drops by $60\%$ to $40\%$.
  - The reading is flagged as `QUARANTINED` and isolated from the risk engine.
- **Observed Behavior**:
  - The risk score **DOES NOT jump to Critical**—it remains safely at $24/100$ (`LOW`), proving that the deterministic quarantine prevented a false panic alarm!
  - A golden **"Quarantined Sensor Reading"** alert card appears with raw data logs.

---

### 📢 Scenario 7: Operator Siren Authorization & Multi-Channel Dispatch
- **How to Trigger**: On a Critical risk state, click **"Authorize Emergency Broadcast"** in the operator command bar.
- **Under the Hood**:
  - Calls `trpc.alerts.operatorApproval.useMutation()`.
  - Generates a cryptographically unique `dispatchId` (`DISPATCH-1756819200-XXXX`).
  - Simulates instant SMS dispatch to 24 local village panchayat heads, browser push notifications to 1,420 registered residents, and emergency VHF radio alerts to 4 highway police patrol units.
- **Observed Behavior**:
  - An official green **"Delivered & Confirmed"** receipt appears with exact timestamps and localized text previews in Kannada/Tamil/Malayalam.

---

## 3. Evaluating State Progression in the UI

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SURVEYOR'S FIELD CONSOLE                               │
│  [ Scenario Sandbox: Normal | Persistent Rain | Extreme Storm | Tilt Spike | Low Batt ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────────────────────┐   │
│   │   INTEGRATED RISK GAUGE   │    │            INTERACTIVE GIS TERRAIN MAP        │   │
│   │          84 / 100         │    │  [●] KDG-03 (Kodagu): 84 (CRITICAL) [PULSING] │   │
│   │         [CRITICAL]        │    │  [●] WND-04 (Wayanad): 42 (MODERATE)          │   │
│   │  Rain: 38mm  Soil: 89%    │    │  [●] CKM-01 (Chikkamagaluru): 18 (LOW)        │   │
│   │  Tilt: 0.12° Hist: 85     │    │  [▲] NASA EONET Event: Landslide Active       │   │
│   └───────────────────────────┘    └───────────────────────────────────────────────┘   │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ 🤖 GEMINI 3.5 EXPLAINABLE RISK INTELLIGENCE                                    │   │
│   │ "Critical slope failure imminent along the Western Ghats escarpment."          │   │
│   │ Why: Rapid saturation has created a high-pressure slip plane along bedrock.    │   │
│   │ Actions: Evacuate red-zone valleys; reroute NH 10 traffic to coastal detour.   │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────────────────────┐   │
│   │  5-LANGUAGE ALERT PREVIEW │    │            OFFLINE CITIZEN REPORT QUEUE       │   │
│   │  [KN] ಕೊಡಗು ಪ್ರದೇಶದಲ್ಲಿ...  │    │  #CR-104: 15cm tension crack on coffee estate │   │
│   │  [TA] தீவிர நிலச்சரிவு... │    │  Status: Verified Ground Hazard (Signed Off)  │   │
│   └───────────────────────────┘    └───────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Automated Verification Test Suite

To run the automated test suite that programmatically validates all scenarios:

```bash
pnpm test
```

### Passing Test Suites Summary:
- `server/riskEngine.test.ts`: Validates 4-factor risk math and threshold boundaries.
- `server/anomalyValidation.test.ts`: Validates all 5 quarantine stages and spike rejection.
- `server/hardwareIngestService.test.ts`: Tests edge payload ingestion and live buffer caching.
- `server/eonetService.test.ts`: Verifies NASA EONET caching and fallback circuit breakers.
- `server/aiRiskService.test.ts`: Tests multilingual assessment generation across 5 Indic languages.
- `server/googleTranslateService.test.ts`: Verifies dynamic translation caching.
- `client/src/lib/reportQueue.test.ts`: Tests offline report queue persistence in localStorage.
- `client/src/lib/notificationTranslations.test.ts`: Validates pre-compiled template integrity.
