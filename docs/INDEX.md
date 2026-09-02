# 📚 Landsora (LEWS) — Master Documentation Index

Welcome to the comprehensive documentation suite for **Landsora — Landslide Early Warning & Risk Monitoring System (LEWS)**.

This documentation is meticulously structured to serve **two distinct audiences**:
1. **Non-programmers, domain researchers, and disaster managers**: People who want to understand *what* the system does, *why* landslides occur, *how* the sensors and algorithms work conceptually (using intuitive analogies), and *how* the dual-audience platform operates during an emergency.
2. **Software engineers, hardware designers, and hackathon competitors**: Developers who need an in-depth, file-by-file reference of the entire architecture, algorithms, data schemas, tRPC APIs, edge firmware, configuration files, and deployment strategies.

---

## 🧭 Documentation Navigator

| Document | Description & Target Audience | Core Topics Covered |
|---|---|---|
| [**01. Executive Overview & Core Concepts**](./01_EXECUTIVE_OVERVIEW_AND_CONCEPTS.md) | **High-Level Plain-English Guide** (Anyone / Non-Technical) | The real-world problem, mountain mechanics, simple analogies, dual-audience model (Citizen vs Authority), core safety philosophy. |
| [**02. Complete System Architecture**](./02_COMPLETE_SYSTEM_ARCHITECTURE.md) | **System Architecture & Data Flows** (Technical & Conceptual) | Multi-tier topology, 5-stage anomaly quarantine, 4-factor deterministic risk math, Google Gemini AI grounding, 5-language alert matrix. |
| [**03. File-by-File Exhaustive Reference**](./03_FILE_BY_FILE_EXHAUSTIVE_REFERENCE.md) | **Complete Codebase Breakdown** (Developers / Reviewers) | In-depth analysis of **every single file** in the repository: root configs, server services, core utilities, shared types, UI components, pages, firmware, and tests. |
| [**04. Data Models, API & Protocols**](./04_DATA_MODELS_API_AND_PROTOCOLS.md) | **API & Schema Reference** (Backend & Frontend Devs) | tRPC router definitions, REST ingestion endpoints, Zod validation schemas, database tables, MQTT payloads, and anomaly quarantine rules. |
| [**05. IoT Hardware & Embedded Systems**](./05_IOT_HARDWARE_AND_EMBEDDED_SYSTEMS.md) | **Edge Engineering & Firmware Guide** (Hardware Devs / IoT) | ESP32 pinouts, sensor wiring (MPU6050, Soil Moisture, Rain Gauge, BME280), solar power budget, FreeRTOS firmware, calibration. |
| [**06. Simulation Sandbox & Scenarios**](./06_SIMULATION_SANDBOX_AND_SCENARIOS.md) | **Interactive Demo & Test Scenarios** (Evaluators / Testers) | 7 interactive test scenarios (Normal, Storm, Spike, Delay, Battery, Evacuation Approval), expected outputs, state progressions. |
| [**07. Deployment, Operations & Pitch Guide**](./07_DEPLOYMENT_OPERATIONS_AND_HACKATHON_GUIDE.md) | **Setup, Operations & Presentation** (Competitors & DevOps) | Step-by-step local setup (Linux, Mac, Windows), environment variables, production deployment (Vercel vs Node), pitch strategy, and judge FAQs. |

---

## 🌟 Quick Architecture Snapshot

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     1. SENSING LAYER                                        │
│   [ Tipping Rain Gauge ]   [ Capacitive Soil Probe ]   [ MPU6050 IMU Tilt ]   [ BME280 ]    │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ (Edge WiFi / Cellular / LoRa Telemetry)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            2. DETERMINISTIC VALIDATION & QUARANTINE                         │
│   - Physical Range Check   - Clock Drift Check   - Sudden Spike Isolation (<0.08°/sample)   │
│   - Stuck Sensor Flatline  - Cross-Source Meteorological Reconciliation                     │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ (Verified Data Stream + Confidence Score)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             3. 4-FACTOR DETERMINISTIC RISK ENGINE                           │
│   Rainfall (0-100) + Tilt Rate (0-100) + Geological Baseline (0-100) + Recent NASA EONET    │
│   => Integrated Risk Index: 0 to 100 (LOW [0-25], MODERATE [26-50], HIGH [51-75], CRITICAL)│
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ (Computed Risk & Status)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          4. EXPLAINABLE AI LAYER (Google Gemini 3.5)                        │
│   - Translates raw IoT numbers into human-readable situation reports in 5 Indian languages  │
│   - Grounded via Google Search & Google Maps (Zero Safety-Critical Hallucination Policy)    │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ (Type-Safe tRPC RPCs)
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              5. FULL-STACK OPERATIONAL CONSOLE                              │
│   👤 Public Citizen POV: Open risk map, road passes, 5-language advisories, crowd report    │
│   🛡️ Authority Command POV: Multi-node telemetry, sensor calibration, 1-click siren dispatch│
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📖 How to Read These Docs

- **If you are pitching or presenting**: Start with [Document 01](./01_EXECUTIVE_OVERVIEW_AND_CONCEPTS.md) and jump to the presentation strategy in [Document 07](./07_DEPLOYMENT_OPERATIONS_AND_HACKATHON_GUIDE.md).
- **If you are building new features or debugging code**: Read [Document 02](./02_COMPLETE_SYSTEM_ARCHITECTURE.md) and search [Document 03](./03_FILE_BY_FILE_EXHAUSTIVE_REFERENCE.md) for the specific files you are modifying.
- **If you are setting up or fabricating IoT hardware**: Jump straight to [Document 05](./05_IOT_HARDWARE_AND_EMBEDDED_SYSTEMS.md).
