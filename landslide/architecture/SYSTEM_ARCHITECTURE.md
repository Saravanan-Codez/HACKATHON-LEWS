# Landsora LEWS — System Architecture & Data Pipeline

This document details the end-to-end architecture of the **Landsora Landslide Early Warning System**, from physical geotechnical sensors deployed in high-relief mountain terrains to cloud-native risk computation and emergency alerts.

---

## 1. End-to-End System Architecture

```mermaid
flowchart TB
    subgraph "1. Mountain Field Node (ESP32 Edge)"
        direction TB
        S1["Tipping Bucket Rain Gauge<br/>(0.2 mm resolution)"]
        S2["MPU6050 6-DOF IMU<br/>(Slope Inclination & Tilt Rate)"]
        S3["Capacitive Soil Probe v1.2<br/>(Volumetric Water Content %)"]
        S4["BME280 Environmental<br/>(Temp, Humidity, Barometric Press)"]
        BAT["3.7V 3200mAh LiFePO4 Battery<br/>+ 6W Solar Panel / MPPT"]

        S1 -->|Hardware Pulse Interrupt Pin 33| MCU["ESP32 Dual-Core Microcontroller<br/>(FreeRTOS + Deep Sleep Manager)"]
        S2 -->|I2C SDA:21, SCL:22| MCU
        S3 -->|ADC1 CH6 Pin 34 (Analog)| MCU
        S4 -->|I2C 0x76| MCU
        BAT -->|ADC1 CH7 Pin 35 (Divider)| MCU
    end

    subgraph "2. Field Telemetry Uplink"
        MCU -->|Primary Telemetry: JSON over HTTPS / MQTT| 4G["SIM7600 4G LTE-M Cellular / Wi-Fi"]
        MCU -->|Secondary Telemetry: Binary Payload| LORA["SX1262 LoRa 865-867 MHz Gateway"]
        4G --> CLOUD_INGEST["Landsora Ingest API Endpoint<br/>(POST /api/hardware/ingest)"]
        LORA --> CLOUD_INGEST
    end

    subgraph "3. Deterministic Anomaly & Validation Layer"
        CLOUD_INGEST --> ANOM["Physical Constraint Validator<br/>(anomalyValidationService.ts)"]
        ANOM -->|Spike / Noise Detected| QUAR["Quarantine Buffer<br/>(Marked for Operator Review)"]
        ANOM -->|Valid Geotechnical Reading| RISK_ENGINE["Multi-Factor Landslide Risk Engine<br/>(riskEngine.ts)"]
    end

    subgraph "4. Cloud Intelligence & Presentation"
        RISK_ENGINE --> BUFFER["Live Telemetry Buffer<br/>(liveNodesBuffer Map)"]
        RISK_ENGINE -->|Composite Risk >= 75 / Critical| NOTIF["Native HTML5 Desktop Push Alert<br/>+ Local Dialect Toast (KN/TA/ML/HI)"]
        BUFFER --> GIS["Interactive Satellite & Topographic Map<br/>(Leaflet GIS Engine)"]
        BUFFER --> AI["AI Companion Decision Engine<br/>(Gemini Multi-Turn + Google Grounding)"]
    end
```

---

## 2. Edge Microcontroller State Machine

The ESP32 firmware utilizes FreeRTOS and ESP32 RTC timers to maximize power longevity on mountain batteries:

```mermaid
stateDiagram-v2
    [*] --> ULP_SLEEP: Node Deployed

    state ULP_SLEEP {
        [*] --> DeepSleep
        DeepSleep --> RainInterrupt: Rain Bucket Tipped
        RainInterrupt --> IncrementRainCounter: Increment RTC Rain Memory
        IncrementRainCounter --> DeepSleep
        DeepSleep --> TimerWakeup: 30-Second Wakeup Timer Expired
    }

    ULP_SLEEP --> WAKE_AND_SAMPLE: Timer Wakeup
    
    state WAKE_AND_SAMPLE {
        [*] --> PowerOnSensors
        PowerOnSensors --> ReadI2C_MPU6050: Compute Pitch/Roll & Tilt Rate
        ReadI2C_MPU6050 --> SampleSoilMoisture: 16-Sample Overaveraged ADC
        SampleSoilMoisture --> SampleBME280: Ambient Temp & Baro Pressure
        SampleBME280 --> ReadBatteryVoltage: Voltage Divider ADC
    }

    WAKE_AND_SAMPLE --> TRANSMIT_CHECK: Telemetry Vector Ready

    state TRANSMIT_CHECK {
        [*] --> CheckCellular
        CheckCellular --> SendHTTPS: 4G LTE-M Connected
        CheckCellular --> SendLoRa: Cellular Offline -> Switch to LoRa
        SendHTTPS --> FlushLocalCache: HTTP 200 Received
        SendLoRa --> FlushLocalCache: Gateway Ack
        CheckCellular --> StoreSPIFFS: Network Down -> Write to Flash
    }

    TRANSMIT_CHECK --> ULP_SLEEP: Telemetry Cycle Complete
```

---

## 3. Telemetry Transmission Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor MountainNode as ESP32 Field Node (KDG-03)
    participant IngestAPI as Landsora Ingest API
    participant Validator as Anomaly Validation Service
    participant RiskCalc as Deterministic Risk Engine
    participant PushService as HTML5 Push / Alert System
    actor Operator as Emergency Control Center

    MountainNode->>IngestAPI: POST /api/hardware/ingest (JSON Telemetry Payload)
    IngestAPI->>Validator: validateTelemetryReading(payload)
    
    alt Sensor Data Anomaly Detected (e.g., impossible 45° vibration spike)
        Validator-->>IngestAPI: Status: QUARANTINED (Confidence: 20%)
        IngestAPI-->>MountainNode: HTTP 202 Accepted (Flagged for Quarantine)
        IngestAPI->>Operator: Alert Operator: Node KDG-03 sensor noise quarantined
    else Valid Sensor Telemetry
        Validator-->>IngestAPI: Status: ACCEPTED (Confidence: 100%)
        IngestAPI->>RiskCalc: computeGeotechnicalRisk(rain, soil, tilt)
        RiskCalc-->>IngestAPI: Risk Index: 78/100 (Tier: CRITICAL)
        IngestAPI-->>MountainNode: HTTP 200 OK (Processed)
        IngestAPI->>PushService: triggerCriticalAlert({ nodeId: "KDG-03", risk: 78 })
        PushService->>Operator: Desktop Push Notification & Local Dialect Voice Alert
    end
```

---

## 4. Multi-Factor Risk Assessment Algorithm

The Landsora cloud risk computation combines real-time physical parameters with weighted geotechnical coefficients:

$$	ext{Risk Index} = (w_r \cdot S_{	ext{rain}}) + (w_s \cdot S_{	ext{soil}}) + (w_t \cdot S_{	ext{tilt}})$$

Where:
- $w_r = 0.40$ (Precipitation intensity weight)
- $w_s = 0.35$ (Capacitive soil moisture saturation weight)
- $w_t = 0.25$ (Inclinometer angular tilt rate weight)

```mermaid
graph LR
    A["Rainfall (mm/hr)<br/>Threshold: > 25 mm/hr"] -->|40% Weight| R[Composite Risk Index 0-100]
    B["Soil Moisture (%)<br/>Threshold: > 75% Saturation"] -->|35% Weight| R
    C["Slope Tilt Drift (°/hr)<br/>Threshold: > 0.05 °/hr"] -->|25% Weight| R
    
    R --> D{Risk Level}
    D -->|Score < 40| E[STABLE / LOW]
    D -->|Score 40 - 74| F[WATCH / MODERATE]
    D -->|Score >= 75| G[CRITICAL / HIGH]
```
