# Landsora — IoT & Disaster Decision Threat Model

This document identifies security boundaries, attack vectors, and automated mitigations for the **Landsora** early warning system.

---

## 1. Threat Matrix

| Threat Category | Attack Vector | Severity | Automated Landsora Mitigation |
|---|---|---|---|
| **Fake / Spoofed Telemetry** | Malicious device publishes false heavy rain or tilt jump to induce panic. | **HIGH** | **Deterministic Anomaly & Physical Range Checks**: Rejects values outside calibrated physical envelopes; quarantines sudden unphysical spikes (>0.08°/sample); cross-checks against regional meteorological APIs. |
| **Replay Attacks** | Attacker captures and re-sends valid historical high-risk telemetry packets. | **HIGH** | **Sequence Numbers & Strict UTC Windows**: Rejects duplicate sequence numbers and payloads older than 30 seconds or exhibiting future clock drift. |
| **Unauthorized Evacuation Siren** | Attacker calls alert API to broadcast mass SMS / sirens to panchayats. | **CRITICAL** | **Operator Approval Workflow & Multi-Signal Confirmation**: State-level alerts require 2-person rule or authenticated DDMA role authorization; rate-limited with deduplication filters. |
| **Sensor Hardware Tamper / Failure** | Mud, insect nesting, or physical disconnection causes flatline or zero readings. | **MEDIUM** | **Flatline & Drift Detector**: Detects static readings during active precipitation; flags device health degradation and penalizes data confidence score. |
| **Eavesdropping / MITM on Ingestion** | Attacker intercepts unencrypted sensor stream in transit. | **MEDIUM** | **TLS 1.3 / MQTTS on Port 8883**: Mandatory encryption for all cloud broker traffic; unique per-device PSK or X.509 client certificates. |

---

## 2. Telemetry Ingestion Verification Loop

```
+---------------------------+
|  Incoming MQTT Telemetry  |
+---------------------------+
              │
              ▼
    [ Schema & Version Check ]  ───(Invalid)───► [ Drop & Log Security Alert ]
              │
              ▼
    [ Sequence & Time Check ]   ───(Replay)────► [ Drop Duplicate Message ]
              │
              ▼
    [ Range & Spike Check ]     ───(Unphysical)► [ Quarantine Record & Penalize Confidence ]
              │
              ▼
    [ Cross-Source Crosscheck ] ───(Conflict)──► [ Reduce Confidence Score ]
              │
              ▼
    [ Deterministic Risk Calc ]
              │
              ▼
  [ Dashboard & Operator Queue ]
```
