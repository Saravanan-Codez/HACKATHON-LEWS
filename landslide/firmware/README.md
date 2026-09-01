# Landsora LEWS — ESP32 Edge Firmware Guide

This directory contains the production C++ Arduino firmware for the **Landsora Mountain Sensor Node**.

---

## 🛠️ Compilation & Flashing Instructions

### Option 1: PlatformIO (Recommended)

1. Install **PlatformIO** (VS Code extension or CLI).
2. Create `platformio.ini` in the node directory:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    bblanchon/ArduinoJson @ ^6.21.3
```

3. Build and Flash:
```bash
pio run --target upload
pio device monitor
```

---

### Option 2: Arduino IDE

1. Add ESP32 board URL to Arduino Preferences:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
2. Install **ArduinoJson** library via Library Manager.
3. Open `esp32_lews_node/esp32_lews_node.ino`.
4. Select Board: **ESP32 Dev Module**.
5. Upload!
