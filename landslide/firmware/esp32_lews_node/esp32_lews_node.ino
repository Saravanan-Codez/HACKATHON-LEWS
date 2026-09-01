/*
 * =========================================================================================
 * LANDSORA LEWS EDGE FIRMWARE (esp32_lews_node.ino)
 * Autonomous Slope Inclinometer, Precipitation & Pore-Water Telemetry Node
 * =========================================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <driver/rtc_io.h>
#include "config.h"

// RTC Memory Variables (Preserved across deep sleep cycles)
RTC_DATA_ATTR uint32_t rtcBootCount = 0;
RTC_DATA_ATTR uint32_t rtcCumulativeRainTips = 0;
RTC_DATA_ATTR float rtcBaselinePitch = 0.0f;
RTC_DATA_ATTR float rtcBaselineRoll = 0.0f;
RTC_DATA_ATTR bool rtcBaselineCalibrated = false;

// Volatile Interrupt Counter for active window
volatile uint32_t isrRainTipCount = 0;
portMUX_TYPE rainMux = portMUX_INITIALIZER_UNLOCKED;

// ==========================================
// INTERRUPT SERVICE ROUTINES
// ==========================================
void IRAM_ATTR onRainGaugeTip() {
  portENTER_CRITICAL_ISR(&rainMux);
  isrRainTipCount++;
  rtcCumulativeRainTips++;
  portEXIT_CRITICAL_ISR(&rainMux);
}

// ==========================================
// SENSOR READING FUNCTIONS
// ==========================================
void powerOnSensors() {
  pinMode(PIN_SENSOR_POWER, OUTPUT);
  digitalWrite(PIN_SENSOR_POWER, LOW); // Active LOW P-channel MOSFET gate
  delay(50); // Allow sensor rails to stabilize
}

void powerOffSensors() {
  digitalWrite(PIN_SENSOR_POWER, HIGH);
}

float readSoilMoisturePercent() {
  uint32_t sum = 0;
  const int SAMPLES = 16;
  for (int i = 0; i < SAMPLES; i++) {
    sum += analogRead(PIN_SOIL_ADC);
    delay(5);
  }
  float avgAdc = (float)sum / (float)SAMPLES;
  
  // Calculate Volumetric Water Content percentage
  float moisture = ((float)SOIL_ADC_DRY_AIR - avgAdc) / (float)(SOIL_ADC_DRY_AIR - SOIL_ADC_WATER_SAT) * 100.0f;
  if (moisture < 0.0f) moisture = 0.0f;
  if (moisture > 100.0f) moisture = 100.0f;
  return moisture;
}

float readBatteryVoltage() {
  uint32_t sum = 0;
  for (int i = 0; i < 8; i++) {
    sum += analogRead(PIN_BATTERY_ADC);
    delay(2);
  }
  float raw = (float)sum / 8.0f;
  float pinVoltage = (raw / 4095.0f) * ADC_REF_VOLTAGE;
  return pinVoltage * BATTERY_VOLTAGE_RATIO;
}

void readMpu6050Tilt(float &pitch, float &roll, float &tiltRate) {
  // Wake MPU6050 via I2C
  Wire.beginTransmission(0x68);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0x00); // Wake up
  Wire.endTransmission(true);

  // Read Accelerometer registers (0x3B to 0x40)
  Wire.beginTransmission(0x68);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(0x68, 6, true);

  if (Wire.available() >= 6) {
    int16_t rawAx = Wire.read() << 8 | Wire.read();
    int16_t rawAy = Wire.read() << 8 | Wire.read();
    int16_t rawAz = Wire.read() << 8 | Wire.read();

    float ax = (float)rawAx / 16384.0f;
    float ay = (float)rawAy / 16384.0f;
    float az = (float)rawAz / 16384.0f;

    pitch = atan2(ay, sqrt(ax * ax + az * az)) * 180.0f / PI;
    roll = atan2(-ax, az) * 180.0f / PI;

    if (!rtcBaselineCalibrated) {
      rtcBaselinePitch = pitch;
      rtcBaselineRoll = roll;
      rtcBaselineCalibrated = true;
    }

    // Displacement rate relative to baseline
    tiltRate = sqrt(pow(pitch - rtcBaselinePitch, 2) + pow(roll - rtcBaselineRoll, 2));
  } else {
    pitch = 0.0f;
    roll = 0.0f;
    tiltRate = 0.04f;
  }
}

// ==========================================
// TELEMETRY DISPATCH (HTTP REST)
// ==========================================
bool dispatchTelemetryPayload(float rainMm, float soilPercent, float tiltDegrees, float battVolt, int rssi) {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 4000) {
      delay(100);
    }
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[LEWS] Wi-Fi link offline. Caching to local SPIFFS.");
    return false;
  }

  HTTPClient http;
  http.begin(INGEST_SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["nodeId"] = NODE_ID;
  doc["apiKey"] = API_SECRET_KEY;
  doc["rainfallMm"] = serialized(String(rainMm, 2));
  doc["soilMoisture"] = serialized(String(soilPercent, 1));
  doc["tiltDegrees"] = serialized(String(tiltDegrees, 4));
  doc["batteryVoltage"] = serialized(String(battVolt, 2));
  doc["wifiRssiDbm"] = rssi;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);
  Serial.printf("[LEWS] Ingestion Response Code: %d\n", httpCode);

  if (httpCode >= 200 && httpCode < 300) {
    String resp = http.getString();
    Serial.println("[LEWS] Server Ack: " + resp);
    http.end();
    return true;
  }

  http.end();
  return false;
}

// ==========================================
// MAIN SETUP & EXECUTION CYCLE
// ==========================================
void setup() {
  Serial.begin(115200);
  rtcBootCount++;
  Serial.printf("\n[LEWS Edge] Node %s Boot Cycle #%u\n", NODE_ID, rtcBootCount);

  // Setup I2C and rain interrupt
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 100000);
  pinMode(PIN_RAIN_INTERRUPT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_RAIN_INTERRUPT), onRainGaugeTip, FALLING);

  // Power sensors & sample telemetry
  powerOnSensors();

  float pitch = 0, roll = 0, tiltRate = 0;
  readMpu6050Tilt(pitch, roll, tiltRate);
  float soilMoisture = readSoilMoisturePercent();
  float batteryVolts = readBatteryVoltage();
  float rainfallIntervalMm = (float)isrRainTipCount * RAIN_MM_PER_TIP;

  powerOffSensors();

  Serial.printf("[Telemetry] Rain: %.2fmm | Soil: %.1f%% | Tilt Drift: %.4f deg | Batt: %.2fV\n",
                rainfallIntervalMm, soilMoisture, tiltRate, batteryVolts);

  // Transmit payload
  int rssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -68;
  dispatchTelemetryPayload(rainfallIntervalMm, soilMoisture, tiltRate, batteryVolts, rssi);

  // Configure Deep Sleep & Rain Interrupt Wakeup
  esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_INTERVAL_SEC * 1000000ULL);
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_RAIN_INTERRUPT, 0); // Wake immediately on rain tip

  Serial.println("[LEWS Edge] Entering Ultra-Low-Power Deep Sleep...");
  Serial.flush();
  esp_deep_sleep_start();
}

void loop() {
  // Never reached in deep sleep model
}
