# Landsora LEWS — Telemetry Communication Protocol

This document defines the network transport formats, JSON schemas, MQTT topics, and LoRaWAN payload specifications used by Landsora edge field nodes and backend ingestion services.

---

## 1. HTTP/HTTPS REST Ingest Endpoint

* **Endpoint**: `POST /api/hardware/ingest`
* **Content-Type**: `application/json`
* **Authentication**: Optional Bearer Token or `apiKey` in JSON payload

### JSON Telemetry Payload Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LandsoraHardwareTelemetry",
  "type": "object",
  "properties": {
    "nodeId": {
      "type": "string",
      "description": "Unique station alphanumeric ID (e.g. KDG-03, WYD-04)",
      "example": "KDG-03"
    },
    "apiKey": {
      "type": "string",
      "description": "Pre-shared station secret key for payload integrity"
    },
    "rainfallMm": {
      "type": "number",
      "description": "Hourly cumulative precipitation in millimeters",
      "minimum": 0,
      "maximum": 500,
      "example": 24.5
    },
    "soilMoisture": {
      "type": "number",
      "description": "Capacitive volumetric water content percentage (0 - 100%)",
      "minimum": 0,
      "maximum": 100,
      "example": 78.2
    },
    "tiltDegrees": {
      "type": "number",
      "description": "Slope inclination displacement rate in degrees per hour",
      "minimum": 0,
      "maximum": 90,
      "example": 0.084
    },
    "batteryVoltage": {
      "type": "number",
      "description": "LiFePO4 battery pack voltage in Volts",
      "minimum": 2.5,
      "maximum": 4.5,
      "example": 3.92
    },
    "wifiRssiDbm": {
      "type": "number",
      "description": "Cellular or Wi-Fi Received Signal Strength Indicator in dBm",
      "minimum": -120,
      "maximum": 0,
      "example": -68
    },
    "temperatureC": {
      "type": "number",
      "description": "Ambient environmental temperature in Celsius",
      "example": 21.4
    },
    "humidity": {
      "type": "number",
      "description": "Relative air humidity percentage (0 - 100%)",
      "example": 92.5
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 UTC timestamp of sensor sample",
      "example": "2026-09-01T15:10:00.000Z"
    }
  },
  "required": ["nodeId", "rainfallMm", "soilMoisture", "tiltDegrees"]
}
```

### Ingestion Response

```json
{
  "success": true,
  "nodeId": "KDG-03",
  "calculatedRiskScore": 72,
  "calculatedRiskLevel": "CRITICAL",
  "validation": {
    "status": "ACCEPTED",
    "overallConfidence": 100,
    "anomalies": []
  },
  "message": "Telemetry from hardware node KDG-03 successfully ingested and verified. Risk Index: 72/100 (CRITICAL), Confidence: 100%."
}
```

---

## 2. MQTT Topic Architecture

When deployed with an edge MQTT broker, the field nodes subscribe and publish to the following topics:

| Topic Pattern | Direction | QoS | Description |
| :--- | :---: | :---: | :--- |
| `landsora/telemetry/{nodeId}` | Node $ightarrow$ Broker | 1 | Periodic live sensor readings (JSON) |
| `landsora/alerts/{nodeId}` | Node $ightarrow$ Broker | 2 | Immediate interrupt-driven critical hazard alerts |
| `landsora/heartbeat/{nodeId}` | Node $ightarrow$ Broker | 0 | Diagnostic uptime, battery level, and RSSI (every 10m) |
| `landsora/commands/{nodeId}` | Cloud $ightarrow$ Node | 1 | Remote configuration (sampling rate, calibration offsets) |
| `landsora/ota/{nodeId}` | Cloud $ightarrow$ Node | 2 | Over-The-Air firmware binary update trigger |

---

## 3. LoRaWAN Binary Packing (Compact 12-Byte Payload)

For ultra-low bandwidth mountain transmissions where cellular signal is lost, the telemetry vector is packed into a compact **12-byte binary struct**:

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Node ID (2B)         |      Rainfall x10 (2B)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Soil Moisture x10 (2B)    |       Tilt Rate x1000 (2B)    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Battery mV (2B)          |  Temp x10 (1B)|  Flags/CRC (1B)|
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```
