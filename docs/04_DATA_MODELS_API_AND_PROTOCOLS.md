# 📡 04. Data Models, API & Communication Protocols

> **Complete Interface Contracts, tRPC Routers, REST Ingestion & MQTT Schemas**  
> *A technical reference for backend developers, frontend engineers, and IoT edge hardware integrators.*

---

## 🗂️ Table of Contents

1. [tRPC Master Router Reference](#1-trpc-master-router-reference)
2. [REST Hardware Ingest API (`/api/telemetry/ingest`)](#2-rest-hardware-ingest-api)
3. [Database Models (Drizzle ORM)](#3-database-models-drizzle-orm)
4. [Edge MQTT Topics & Telemetry Payload Schema](#4-edge-mqtt-topics--telemetry-payload-schema)
5. [Deterministic Anomaly Rule Catalog](#5-deterministic-anomaly-rule-catalog)

---

## 1. tRPC Master Router Reference

All API calls from the client to the server are executed via **tRPC** (over HTTP/JSON), providing complete compile-time type safety.

### 🔐 1. Authentication Router (`auth`)

#### `auth.me` (Query)
- **Description**: Returns current authenticated user profile and session state.
- **Input**: `void`
- **Output**:
  ```typescript
  {
    user: {
      id: number;
      openId: string;
      name: string | null;
      email: string | null;
      role: "user" | "admin";
    } | undefined;
    isAuthenticated: boolean;
    isGoogleAccount: boolean;
  }
  ```

#### `auth.googleSignIn` (Mutation)
- **Description**: Authenticates or registers a user via Google Account / SSO.
- **Input**:
  ```typescript
  {
    email: string;      // Valid email format
    name?: string;
    googleId?: string;
  }
  ```
- **Output**: `{ success: boolean; user: User; sessionToken: string }`

#### `auth.logout` (Mutation)
- **Description**: Clears the session cookie (`app_session_id`).
- **Input**: `void`
- **Output**: `{ success: true }`

---

### 🤖 2. Conversational AI Chatbot Router (`chat`)

#### `chat.quota` (Query)
- **Description**: Retrieves remaining daily AI query quota for the active user.
- **Output**:
  ```json
  {
    "isAuthenticated": true,
    "quota": {
      "used": 4,
      "limit": 30,
      "remaining": 26,
      "isUnlimited": false,
      "resetsInHours": 6
    }
  }
  ```

#### `chat.send` (Mutation)
- **Description**: Sends a multi-turn conversation turn to Google Gemini 3.5 Flash with optional live telemetry context and tool grounding.
- **Input**:
  ```typescript
  {
    messages: Array<{
      role: "user" | "model";
      parts: Array<{ text: string }>;
    }>;
    role?: "GEOTECHNICAL_SPECIALIST" | "DISASTER_COORDINATOR" | "FIELD_SURVEYOR";
    model?: "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-3.1-pro-preview";
    grounding?: "none" | "search" | "maps";
    apiKey?: string;
    context?: {
      location?: string;
      rainfall?: number;
      soil?: number;
      tilt?: number;
      riskScore?: number;
      riskLevel?: string;
      language?: "EN" | "HI" | "TA" | "TE" | "KN" | "ML";
    };
  }
  ```
- **Output**:
  ```typescript
  {
    responseMessage: {
      role: "model";
      parts: Array<{ text: string }>;
      groundingSources?: Array<{ title?: string; url?: string }>;
      mapSources?: Array<{ placeId?: string; title?: string; address?: string }>;
      timestamp: string;
    };
    provider: string;
    model: string;
    generatedAt: string;
  }
  ```

---

### 🔍 3. Google Tool Grounding Router (`grounding`)

#### `grounding.search` (Mutation)
- **Description**: Queries Google Search Grounding for real-time IMD bulletins and hazard reports.
- **Input**: `{ query: string; location?: string; language?: string }`
- **Output**:
  ```typescript
  {
    text: string;
    sources: Array<{ title: string; url: string }>;
    searchQueries?: string[];
    provider: string;
    model: string;
    generatedAt: string;
  }
  ```

#### `grounding.maps` (Mutation)
- **Description**: Queries Google Maps Grounding for terrain profiles, mountain passes, and shelters.
- **Input**: `{ location: string; query: string; language?: string }`
- **Output**:
  ```typescript
  {
    text: string;
    places: Array<{ title?: string; address?: string; placeId?: string }>;
    provider: string;
    model: string;
    generatedAt: string;
  }
  ```

---

### 📊 4. Geotechnical Risk & Decision Support Router (`risk`)

#### `risk.score` (Query)
- **Description**: Computes the 4-factor equal-weighted deterministic risk index.
- **Input**:
  ```typescript
  {
    rainfallScore: number;          // 0 to 100
    terrainScore: number;           // 0 to 100
    historicalLandslideScore: number; // 0 to 100
    recentEventScore: number;       // 0 to 100
  }
  ```
- **Output**: `{ score: number; level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; inputs: RiskInputs }`

#### `risk.aiAnalysis` (Mutation)
- **Description**: Synthesizes verified telemetry into a structured JSON assessment via Gemini 3.5 Flash.
- **Input**:
  ```typescript
  {
    location: string;
    rainfall: number;
    weather: string;
    soil: number;
    tilt: number;
    recentEventsNearby: boolean;
    recentEventCount: number;
    historicalContext: string;
    calculatedRiskScore: number;
    calculatedRiskLevel: string;
    language: "EN" | "HI" | "TA" | "TE" | "KN" | "ML";
    dataAvailable: boolean;
  }
  ```
- **Output**:
  ```json
  {
    "provider": "GEMINI_2_5_FLASH_SEARCH_GROUNDED",
    "model": "gemini-2.5-flash",
    "status": "READY",
    "riskLevel": "HIGH",
    "assessment": "Elevated landslide susceptibility in Kodagu. Slope stability is degrading under current hydro-meteorological loading.",
    "why": "Soil moisture at 78% combined with rainfall of 24.5 mm/hr indicates saturated topsoil layers.",
    "factors": [
      "Elevated precipitation rate: 24.5 mm/hr",
      "High soil moisture index: 78.0%",
      "Inclinometer tilt rate: 0.082°/hr"
    ],
    "actions": [
      "Maintain heightened vigilance for tension cracks",
      "Prepare emergency evacuation kits"
    ],
    "warning": "AI provides an interpretation of available environmental data. Official disaster-management authorities should always be followed.",
    "confidence": "HIGH",
    "generatedAt": "2026-09-02T19:00:00.000Z"
  }
  ```

---

### 🚨 5. Operator Emergency Siren & Alerts Router (`alerts`)

#### `alerts.operatorApproval` (Mutation)
- **Description**: Authorizes and triggers mass SMS, panchayat sirens, and push broadcasts.
- **Input**:
  ```typescript
  {
    zoneId: string;
    riskScore: number;
    riskLevel: string;
    operatorName: string;
    language: string;
    channels: string[]; // ["SMS_PANCHAYAT", "BROWSER_PUSH", "POLICE_VHF"]
  }
  ```
- **Output**:
  ```json
  {
    "dispatchId": "DISPATCH-1756819200-4821",
    "status": "APPROVED_AND_DELIVERED",
    "approvedAt": "2026-09-02T19:00:00.000Z",
    "operator": "District Collector (DDMA)",
    "zoneId": "KDG-03",
    "riskScore": 84,
    "riskLevel": "CRITICAL",
    "recipientsSimulated": {
      "smsPanchayatCount": 24,
      "pushSubscribersCount": 1420,
      "policeUnitsNotified": 4
    },
    "deliveryLogs": [
      {
        "channel": "SMS_PANCHAYAT",
        "status": "DELIVERED",
        "timestamp": "2026-09-02T19:00:01.000Z",
        "messagePreview": "[LANDSORA EMERGENCY] KDG-03 risk score 84/100 (CRITICAL)."
      }
    ]
  }
  ```

---

## 2. REST Hardware Ingest API

For simple microcontrollers (ESP32, Arduino, MicroPython, LoRaWAN Gateways), Landsora provides a high-throughput REST HTTP POST endpoint.

### `POST /api/telemetry/ingest`

#### Request Headers
```http
POST /api/telemetry/ingest HTTP/1.1
Host: landsora.live
Content-Type: application/json
```

#### Request JSON Payload
```json
{
  "nodeId": "KDG-03",
  "rainfallMm": 18.4,
  "soilMoisture": 78.2,
  "tiltDegrees": 0.084,
  "batteryVoltage": 3.92,
  "wifiRssiDbm": -64,
  "temperatureC": 21.4,
  "humidity": 86.5,
  "apiKey": "landsora_field_node_key_sec"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "nodeId": "KDG-03",
  "calculatedRiskScore": 73,
  "calculatedRiskLevel": "HIGH",
  "validation": {
    "readingId": "VAL-1756819200-ab3f1",
    "deviceId": "esp32-kdg-03",
    "siteId": "KDG-03",
    "timestampUtc": "2026-09-02T19:00:00.000Z",
    "status": "ACCEPTED",
    "overallConfidence": 100,
    "isQuarantined": false,
    "anomaliesDetected": [],
    "triggeredRules": [],
    "explanationFacts": []
  },
  "message": "Telemetry from hardware node KDG-03 successfully ingested and verified. Risk Index: 73/100 (HIGH), Confidence: 100%."
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "error": "Missing required telemetry fields: nodeId, rainfallMm, soilMoisture, tiltDegrees"
}
```

---

## 3. Database Models (Drizzle ORM)

### Users Table (`users`)
```sql
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Edge MQTT Topics & Telemetry Payload Schema

### Topic Convention
- **Telemetry**: `landsora/v1/{site_id}/{device_id}/telemetry`
- **Device Health**: `landsora/v1/{site_id}/{device_id}/health`
- **Configuration Downlink**: `landsora/v1/{site_id}/{device_id}/config`
- **Command Acknowledgment**: `landsora/v1/{site_id}/{device_id}/ack`

### Versioned Telemetry Payload (`v1.0`)
```json
{
  "schema_version": "1.0",
  "message_id": "c6a1b24d-8e4f-4d32-9c12-f4728ab19382",
  "sequence_number": 4821,
  "site_id": "KDG-03",
  "device_id": "landsora-esp32-001",
  "captured_at_utc": "2026-09-02T19:00:00.000Z",
  "sent_at_utc": "2026-09-02T19:00:00.120Z",
  "source_mode": "LIVE",
  "sensors": {
    "rainfall_mm_interval": 18.4,
    "rainfall_mm_24h": 68.2,
    "soil_moisture_percent": 78.2,
    "tilt_x_degrees": 0.084,
    "tilt_y_degrees": 0.042,
    "temperature_c": 21.4,
    "humidity_percent": 86.5,
    "pressure_hpa": 1008.4
  },
  "device_health": {
    "battery_voltage": 3.92,
    "battery_percent": 86,
    "wifi_rssi_dbm": -64,
    "free_heap_bytes": 184520,
    "uptime_seconds": 86420,
    "firmware_version": "1.0.0"
  }
}
```

---

## 5. Deterministic Anomaly Rule Catalog

| Rule ID | Rule Name | Evaluated Condition | Severity | Penalty | Quarantine Action |
|---|---|---|---|---|---|
| `TIME-01` | Malformed Date | `isNaN(Date.parse(timestamp))` | **CRITICAL** | -40% | Isolate record |
| `TIME-02` | Future Drift | Telemetry timestamp is $>2\text{ min}$ ahead of server RTC | **HIGH** | -25% | Log clock drift |
| `TIME-03` | Stale Data | Telemetry is $>30\text{ min}$ old | **WARNING** | -30% | Flag latency |
| `RANGE-01`| Negative Rain | `rainfall < 0 mm` | **CRITICAL** | -50% | Substitute with 0.0 |
| `RANGE-02`| Ceiling Rain | `rainfall > 150 mm/hr` | **HIGH** | -35% | Substitute with baseline |
| `RANGE-03`| Soil Moisture Bounds | `soil < 0%` or `soil > 100%` | **CRITICAL** | -40% | Substitute with 55.0% |
| `RANGE-04`| Tilt Plausibility | `abs(tilt) > 45.0°` | **HIGH** | -45% | Flag sensor mast tip |
| `HW-01`   | Low Battery | `batteryVoltage < 3.3V` | **WARNING** | -15% | Warning for ADC noise |
| `SPIKE-01`| Sudden Tilt Jump | Single step tilt diff $>0.08^\circ$ | **CRITICAL** | -60% | **AUTOMATIC QUARANTINE** |
| `FLATLINE-01`| Stuck Soil Probe | Constant soil value over 8 samples while rain $>10\text{ mm/hr}$ | **HIGH** | -25% | Flag stuck sensor |
| `CROSS-01`| Cross-Source Mismatch | Rain gauge differs by $>25\text{ mm/hr}$ from regional weather radar | **WARNING** | -20% | Confidence discount |
