# Landsora LEWS — Electrical Wiring & Pinout Guide

This guide provides the complete electrical pinout, schematic connections, and pull-up resistor requirements for assembling the **Landsora ESP32 Slope Sensor Node**.

---

## 1. Pin Mapping Table

| ESP32 GPIO Pin | Connected Module | Signal / Protocol | Notes |
| :--- | :--- | :--- | :--- |
| **GPIO 21** | MPU6050 & BME280 | `I2C SDA` | 4.7kΩ Pull-Up to 3.3V |
| **GPIO 22** | MPU6050 & BME280 | `I2C SCL` | 4.7kΩ Pull-Up to 3.3V |
| **GPIO 33** | Tipping Bucket Rain Gauge | `INTERRUPT` | 10kΩ Pull-Up + 100nF Debounce Cap |
| **GPIO 34** | Capacitive Soil Moisture Probe | `ANALOG ADC1_CH6` | Input only pin (0 - 3.3V linear) |
| **GPIO 35** | Battery Voltage Divider | `ANALOG ADC1_CH7` | 100kΩ / 100kΩ divider from LiFePO4 battery |
| **GPIO 16** | SIM7600 4G Module | `UART2 RX` | Connect to SIM7600 TX |
| **GPIO 17** | SIM7600 4G Module | `UART2 TX` | Connect to SIM7600 RX |
| **GPIO 4** | SIM7600 Power Key | `DIGITAL OUTPUT` | Active high pulse to wake/power SIM7600 |
| **GPIO 25** | Sensor Power Enable Gate | `DIGITAL OUTPUT` | P-channel MOSFET to cut sensor power during deep sleep |
| **3V3** | All 3.3V Sensors | `POWER` | Regulated 3.3V LDO rail |
| **GND** | Common Ground | `GROUND` | Star-ground topology to eliminate ground loops |

---

## 2. Electrical Wiring Diagram

```mermaid
graph LR
    subgraph "Power Subsystem"
        SOLAR["Solar Panel (6V)"] -->|VIN| MPPT["CN3791 MPPT Charger"]
        MPPT -->|BAT+| BATT["LiFePO4 3.2V Battery"]
        BATT -->|VBAT| LDO["Ultra-Low Iq LDO (3.3V)"]
        BATT -->|R1 100k / R2 100k Divider| DIV["Voltage Divider -> GPIO 35"]
    end

    subgraph "ESP32 Controller & Sensors"
        LDO -->|3.3V| ESP["ESP32 Dev Module"]
        LDO -->|Via MOSFET Gate GPIO 25| SENS_VCC["Sensor VCC Rail"]

        SENS_VCC --> MPU["MPU6050 Inclinometer"]
        SENS_VCC --> BME["BME280 Weather Sensor"]
        SENS_VCC --> SOIL["Capacitive Soil Probe"]

        MPU -->|SDA (GPIO 21) & SCL (GPIO 22)| ESP
        BME -->|SDA (GPIO 21) & SCL (GPIO 22)| ESP
        SOIL -->|AOUT -> GPIO 34| ESP

        RAIN["Tipping Bucket Reed Switch"] -->|Pulse -> GPIO 33| ESP
    end

    subgraph "Uplink Telemetry"
        BATT -->|Direct 3.8V Rail| MODEM["SIM7600 4G LTE-M"]
        ESP -->|UART TX:17, RX:16, PWR:4| MODEM
    end
```

---

## 3. Hardware Debouncing & Transient Protection

```
               +3.3V
                 |
                [10k] Pull-up
                 |
Tipping Bucket   +--------+----------> ESP32 GPIO 33 (Active LOW Interrupt)
Reed Switch      |        |
(Normally Open) [ ]     [100nF] Ceramic Capacitor (Hardware Debounce)
                 |        |
                GND      GND
```
