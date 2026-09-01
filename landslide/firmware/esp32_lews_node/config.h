/*
 * =========================================================================================
 * LANDSORA LEWS EDGE FIRMWARE CONFIGURATION (config.h)
 * Physical Pin Mapping, Geotechnical Thresholds, Calibration Constants & Network Endpoints
 * =========================================================================================
 */

#ifndef LANDSORA_CONFIG_H
#define LANDSORA_CONFIG_H

// ==========================================
// 1. NODE IDENTIFICATION & SECURITY
// ==========================================
#define NODE_ID              "KDG-03"               // Station Alphanumeric Identifier
#define API_SECRET_KEY       "landsora-secure-edge" // Station Pre-Shared HMAC Secret
#define FIRMWARE_VERSION     "v2.4.0-edge"

// ==========================================
// 2. PIN DEFINITIONS
// ==========================================
#define PIN_I2C_SDA          21                     // MPU6050 & BME280 I2C SDA
#define PIN_I2C_SCL          22                     // MPU6050 & BME280 I2C SCL
#define PIN_RAIN_INTERRUPT   33                     // Tipping Bucket Interrupt Pin
#define PIN_SOIL_ADC         34                     // Capacitive Soil Moisture Analog (ADC1_CH6)
#define PIN_BATTERY_ADC      35                     // Battery Voltage Divider (ADC1_CH7)
#define PIN_SENSOR_POWER     25                     // P-Channel MOSFET Sensor Power Gate
#define PIN_MODEM_PWRKEY     4                      // SIM7600 Power Toggle Key
#define PIN_MODEM_TX         17                     // ESP32 TX -> SIM7600 RX
#define PIN_MODEM_RX         16                     // ESP32 RX -> SIM7600 TX

// ==========================================
// 3. CALIBRATION CONSTANTS
// ==========================================
// Capacitive Soil Moisture Calibration (Raw ADC 0-4095)
#define SOIL_ADC_DRY_AIR     3150                   // Value measured in dry air (0% moisture)
#define SOIL_ADC_WATER_SAT   1320                   // Value measured in 100% water saturation

// Rain Gauge Calibration (0.2 mm precipitation per mechanical bucket tip)
#define RAIN_MM_PER_TIP      0.20f

// Battery Voltage Divider Calibration (100k / 100k divider + ADC calibration)
#define BATTERY_VOLTAGE_RATIO 2.00f                 // 100k + 100k voltage divider ratio
#define ADC_REF_VOLTAGE      3.30f

// ==========================================
// 4. POWER MANAGEMENT & DEEP SLEEP
// ==========================================
#define SLEEP_INTERVAL_SEC   30                     // Nominal deep sleep duration in seconds
#define EMERGENCY_SAMPLE_SEC 10                     // High-frequency sleep duration under CRITICAL risk

// ==========================================
// 5. CLOUD ENDPOINTS & NETWORK
// ==========================================
#define INGEST_SERVER_URL    "https://landsora.app/api/hardware/ingest"
#define INGEST_HOST_FALLBACK "192.168.1.100"
#define INGEST_PORT_FALLBACK 3000

// Wi-Fi Fallback Credentials (Used if 4G modem is offline)
#define WIFI_SSID            "Landsora_Mountain_Net"
#define WIFI_PASS            "SlopeSafety2026"

#endif // LANDSORA_CONFIG_H
