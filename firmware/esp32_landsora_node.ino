/*
 * =========================================================================================
 * LANDSORA IOT MOUNTAIN NODE FIRMWARE (ESP32 / ESP32-S3)
 * Landslide Early Warning System — Hardware Telemetry Gateway
 * =========================================================================================
 * 
 * Target Hardware:
 *  - ESP32-WROOM-32 / TTGO T-Beam / ESP32-S3
 *  - MPU6050 6-Axis Accelerometer/Gyroscope (I2C: SDA=21, SCL=22)
 *  - Capacitive Soil Moisture Sensor v1.2 / v2.0 (Analog: GPIO 34 / ADC1_CH6)
 *  - Tipping Bucket Rain Gauge Reed Switch (Digital Interrupt: GPIO 4)
 *  - Solar Li-ion Battery Voltage Divider (Analog: GPIO 32)
 * 
 * Connectivity:
 *  - Primary: 2.4GHz WiFi / Cellular Modem (SIM800L / SIM7600) / LoRa Gateway
 *  - Protocol: HTTP REST POST JSON to /api/telemetry/ingest
 * =========================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>

// 1. NETWORK & INGESTION CONFIGURATION
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* LANDSORA_ENDPOINT = "http://YOUR_SERVER_IP:3000/api/telemetry/ingest";
const char* NODE_ID = "CRG-04"; // e.g. CRG-04 (Kodagu), IDK-01 (Idukki), WYD-02 (Wayanad)
const char* API_KEY = "landsora_secure_edge_key";

// 2. PIN DEFINITIONS
#define PIN_RAIN_INTERRUPT 4    // Tipping bucket pulse (0.2mm per tip)
#define PIN_SOIL_ANALOG    34   // Capacitive soil moisture (ADC1)
#define PIN_BATTERY_ADC    32   // 100k/100k voltage divider to read Li-ion cell

// 3. SENSOR CALIBRATION CONSTANTS
const int SOIL_DRY_ADC = 3200;  // ADC in dry air
const int SOIL_WET_ADC = 1400;  // ADC in saturated water
const float RAIN_MM_PER_TIP = 0.2; // Millimeters of rain per bucket tip

// 4. RUNTIME STATE
volatile unsigned long rainTipCount = 0;
unsigned long lastTransmissionTime = 0;
const unsigned long TRANSMIT_INTERVAL_MS = 30000; // Send telemetry every 30 seconds

// MPU6050 I2C Address & Angles
const int MPU_ADDR = 0x68;
float accelX = 0, accelY = 0, accelZ = 0;
float currentTiltAngleDeg = 0.0;

// Hardware interrupt for tipping bucket rain gauge
void IRAM_ATTR onRainTip() {
  static unsigned long lastInterruptTime = 0;
  unsigned long interruptTime = millis();
  // 150ms debounce
  if (interruptTime - lastInterruptTime > 150) {
    rainTipCount++;
    lastInterruptTime = interruptTime;
  }
}

void setupMPU6050() {
  Wire.begin(21, 22); // SDA = 21, SCL = 22
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // Power Management Register
  Wire.write(0);    // Wake up MPU6050
  Wire.endTransmission(true);
}

float readSlopeTilt() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Accel X High Register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t rawX = Wire.read() << 8 | Wire.read();
    int16_t rawY = Wire.read() << 8 | Wire.read();
    int16_t rawZ = Wire.read() << 8 | Wire.read();

    accelX = rawX / 16384.0;
    accelY = rawY / 16384.0;
    accelZ = rawZ / 16384.0;

    // Calculate total angular tilt inclination from vertical (Z-axis)
    float pitch = atan2(accelX, sqrt(accelY * accelY + accelZ * accelZ)) * 180.0 / PI;
    float roll = atan2(accelY, sqrt(accelX * accelX + accelZ * accelZ)) * 180.0 / PI;
    currentTiltAngleDeg = sqrt(pitch * pitch + roll * roll);
  }
  return currentTiltAngleDeg;
}

float readSoilMoisturePercent() {
  int rawADC = analogRead(PIN_SOIL_ANALOG);
  // Constrain within calibrated dry/wet envelope
  rawADC = constrain(rawADC, SOIL_WET_ADC, SOIL_DRY_ADC);
  // Map to 0 - 100% saturation
  float moisture = map(rawADC, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);
  return constrain(moisture, 0.0, 100.0);
}

float readBatteryVoltage() {
  int rawADC = analogRead(PIN_BATTERY_ADC);
  // 3.3V reference, 12-bit ADC (4095), 2:1 resistor divider
  float voltage = (rawADC / 4095.0) * 3.3 * 2.0 * 1.05; // 1.05 calibration factor
  return voltage;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("
WiFi Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("
WiFi connection failed. Retrying next cycle.");
  }
}

void transmitTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  // 1. Sample all sensors
  float soilMoisture = readSoilMoisturePercent();
  float tiltDegrees = readSlopeTilt();
  float rainfallInterval = rainTipCount * RAIN_MM_PER_TIP;
  rainTipCount = 0; // Reset pulse accumulator after sampling interval
  float batteryVolts = readBatteryVoltage();
  int wifiRssi = WiFi.RSSI();

  // 2. Build JSON payload
  StaticJsonDocument<300> doc;
  doc["nodeId"] = NODE_ID;
  doc["apiKey"] = API_KEY;
  doc["rainfallMm"] = rainfallInterval;
  doc["soilMoisture"] = soilMoisture;
  doc["tiltDegrees"] = tiltDegrees;
  doc["batteryVoltage"] = batteryVolts;
  doc["wifiRssiDbm"] = wifiRssi;

  String jsonString;
  serializeJson(doc, jsonString);

  // 3. Send HTTP POST to Landsora Ingestion Endpoint
  HTTPClient http;
  http.begin(LANDSORA_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  Serial.println("Transmitting payload: " + jsonString);
  int httpCode = http.POST(jsonString);

  if (httpCode == HTTP_CODE_OK || httpCode == 201) {
    String response = http.getString();
    Serial.println("Landsora Server Response: " + response);
  } else {
    Serial.printf("HTTP POST failed, error code: %d
", httpCode);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("
=== LANDSORA IoT Node Initializing ===");

  pinMode(PIN_RAIN_INTERRUPT, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_RAIN_INTERRUPT), onRainTip, FALLING);

  setupMPU6050();
  connectWiFi();
  Serial.println("Initialization complete. Telemetry streaming active.");
}

void loop() {
  unsigned long now = millis();
  if (now - lastTransmissionTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmissionTime = now;
    transmitTelemetry();
  }
  delay(100);
}
