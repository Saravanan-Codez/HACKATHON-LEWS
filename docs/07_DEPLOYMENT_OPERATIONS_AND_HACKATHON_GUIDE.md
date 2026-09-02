# 🚀 07. Deployment, Operations & Hackathon Presentation Guide

> **Setup Instructions, Environment Variables, Production Deployment & Winning Pitch Strategy**  
> *Everything needed to deploy, operate, and present Landsora (LEWS) with maximum impact.*

---

## 🗂️ Table of Contents

1. [Local Development Setup (All Platforms)](#1-local-development-setup-all-platforms)
2. [Environment Configuration Reference](#2-environment-configuration-reference)
3. [Production Build & Cloud Deployment](#3-production-build--cloud-deployment)
4. [Hackathon Pitch Strategy & Live Demo Script](#4-hackathon-pitch-strategy--live-demo-script)
5. [Anticipated Judge & Evaluator Questions (FAQ)](#5-anticipated-judge--evaluator-questions-faq)

---

## 1. Local Development Setup (All Platforms)

### 📋 Prerequisites
- **Node.js**: `v20.x` or `v22.x` LTS (`v18+` minimum). Check with `node -v`.
- **Git**: Installed and available in your PATH. Check with `git --version`.
- **Package Manager**: **`pnpm`** (v10+ recommended).

---

### 🐧 Linux (Ubuntu / Debian / Fedora / Arch)
```bash
# 1. Clone repository
git clone https://github.com/Saravanan-Codez/HACKATHON-LEWS.git
cd HACKATHON-LEWS

# 2. Enable pnpm
corepack enable || npm install -g pnpm

# 3. Configure environment
cp .env.example .env

# 4. Install dependencies (Native patch resolution)
pnpm install

# 5. Start development server
pnpm dev
```
Open **`http://localhost:3000`** in your web browser.

---

### 🍎 macOS (Apple Silicon M1/M2/M3 & Intel)
```bash
# 1. Clone repository
git clone https://github.com/Saravanan-Codez/HACKATHON-LEWS.git
cd HACKATHON-LEWS

# 2. Install pnpm via Homebrew or Corepack
brew install pnpm || corepack enable

# 3. Configure environment
cp .env.example .env

# 4. Install dependencies
pnpm install

# 5. Start development server
pnpm dev
```

---

### 🪟 Windows (Native PowerShell & WSL2)

#### Option A: Windows Subsystem for Linux (WSL2 - Recommended)
Open your Ubuntu WSL terminal and execute the Linux commands above.

#### Option B: Native PowerShell
```powershell
# 1. Clone repository
git clone https://github.com/Saravanan-Codez/HACKATHON-LEWS.git
cd HACKATHON-LEWS

# 2. Install pnpm globally
npm install -g pnpm

# 3. Copy environment configuration
Copy-Item .env.example .env

# 4. Install dependencies
pnpm install

# 5. Start development server
pnpm dev
```

---

## 2. Environment Configuration Reference

Create a `.env` file in the root directory:

```ini
# =============================================================================
# LANDSORA SYSTEM CONFIGURATION
# =============================================================================

# Server Port (Default: 3000)
PORT=3000
NODE_ENV=development

# Google Gemini API Key (Enables live AI reasoning & Google Search/Maps grounding)
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (MySQL / TiDB / MariaDB connection string)
DATABASE_URL=mysql://root:password@localhost:3306/landsora

# NASA EONET v3 Live Feed URL
NASA_EONET_URL=https://eonet.gsfc.nasa.gov/api/v3/events?category=landslides&status=open&limit=100

# Session Secret Key for JWT Tokens
JWT_SECRET=your_super_secret_jwt_signing_key_32_chars_min
```

---

## 3. Production Build & Cloud Deployment

### 🏗️ 1. Compiling for Production
```bash
# 1. Run static type checking
pnpm check

# 2. Run automated test suite
pnpm test

# 3. Build frontend bundle (Vite) + backend bundle (esbuild)
pnpm build

# 4. Start production Node.js server
pnpm start
```

### ☁️ 2. Vercel Serverless Deployment
Landsora includes a pre-configured `vercel.json` and `api/index.ts` handler:
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist/public`
- **Serverless API Route**: Automatically proxies `/api/*` to `api/index.ts`.

---

## 4. Hackathon Pitch Strategy & Live Demo Script

When presenting Landsora to judges, focus on **the human outcome, geotechnical rigor, and the zero-hallucination safety architecture**.

### ⏱️ 30-Second Elevator Pitch
> *"Every monsoon, landslides kill hundreds of people in the Western Ghats and Himalayas because regional weather forecasts cannot detect what is happening inside the soil. Landsora is an IoT early warning system that combines $15 solar-powered hillside sensors, a 5-stage deterministic anomaly quarantine engine, and Google Gemini 3.5 explainable AI to issue life-saving alerts in 5 Indian languages before a mountain slope collapses."*

---

### 🎬 3-Minute Live Winning Demo Script

#### Minute 1: The Problem & The Sensor Console (0:00 - 1:00)
1. Open `/` (Landing Page). Point to the **"Wet sponge on a cutting board"** problem statement: explain that water saturation and pore pressure cause slope failure, not just rainfall.
2. Click **"Launch Surveyor Console"** (`/dashboard`).
3. Show the **Interactive GIS Terrain Map**: point to the 6 monitored mountain zones (Kodagu, Wayanad, Nilgiris, Darjeeling) and live NASA EONET natural event markers.

#### Minute 2: The Core Differentiator — Deterministic Math vs AI (1:00 - 2:00)
1. Open the **Simulation Sandbox**:
   - Click **"Extreme Storm"**: Show the risk gauge jump to **84 (CRITICAL)**, the audible siren, the mountain road pass closures, and Gemini AI's geotechnical explanation.
   - Switch language to **Kannada (ಕನ್ನಡ)** or **Tamil (தமிழ்)**: Show the instant localized emergency advisory.
2. **The "Killer Feature" Demo (Anomaly Quarantine)**:
   - Click **"Tilt Shock / Spike"**.
   - Explain to the judges: *"A monkey just jumped on our sensor mast, causing an instantaneous 0.095° tilt spike. In a naive system, this causes false panic. In Landsora, our Stage 3 Validation immediately quarantines the spike, preserves the data confidence score, and keeps the risk level safely at LOW."*

#### Minute 3: Action & Life Safety Dispatch (2:00 - 3:00)
1. Toggle to **Authority Command POV** and click **"Authorize Siren & Mass SMS Broadcast"**.
2. Show the generated cryptographic dispatch receipt and logs confirming delivery to 24 village panchayats.
3. Conclude: *"Landsora bridges the gap between physics, AI, and community safety—making mountain roads and villages resilient to climate disasters."*

---

## 5. Anticipated Judge & Evaluator Questions (FAQ)

### Q1: "Why not let AI calculate the risk score directly?"
**Answer**: *"In life-safety systems, AI hallucination is unacceptable. If an LLM misinterprets a number and underestimates a landslide risk, people die. That's why Landsora uses deterministic physics formulas and physical range validation to compute the 0–100 score. We strictly use Gemini 3.5 Flash to translate, explain, and ground the verified numbers for human decision-makers."*

### Q2: "What happens if cellular connectivity goes down during a storm?"
**Answer**: *"Landsora is engineered with three layers of offline resilience: First, our ESP32 edge firmware features dual-uplink failover to long-range LoRaWAN (865 MHz in India). Second, our field nodes buffer up to 10,000 readings in SPIFFS flash memory. Third, our citizen incident reporting UI is offline-first, queuing ground photos in browser localStorage until connectivity returns."*

### Q3: "How do you prevent false alarms from sensor glitches?"
**Answer**: *"Our 5-stage deterministic validation pipeline checks for clock drift, physical bounds, sudden rate-of-change spikes (>0.08°/sample), and stuck sensor flatlines. Quarantined readings are isolated from the risk engine and substituted with calibrated baselines while alerting technicians to inspect the mast."*

### Q4: "How much does a field sensor node cost to deploy?"
**Answer**: *"A complete Landsora node (ESP32 MCU, CN3791 MPPT charger, 10W solar panel, 18650 Li-Ion battery, tipping bucket rain gauge, capacitive soil moisture probe, and MPU6050 inclinometer) costs under ₹2,800 ($34 USD), making it affordable for rural panchayats and district disaster management authorities."*
