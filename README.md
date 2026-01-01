# Nano ARGB

Nano ARGB is a small, USB-connected addressable RGB (5V ARGB) controller developed as a DIY alternative to motherboard RGB headers and closed RGB ecosystems.

The project is currently **USB Serial–based**. HID support is planned, but not implemented yet.  
This design choice favors simplicity, stability, and ease of development.

---

## Features

- 5V ARGB (WS2812 / SK6812 compatible) LED control
- USB Serial communication
- Real-time color and brightness control
- Basic lighting mode selection
- Simple, transparent command protocol
- Persistent state storage (EEPROM)
  - Last mode, color, and brightness are restored after reboot

---

## Known Limitations

- Serial communication only (COM port required)
- No HID support at the moment
- Single-client access
- Not suitable for high-frequency per-LED streaming

---

## Supported Hardware

Nano ARGB is **primarily designed for the Arduino Nano (ATmega328P)**.

Other Arduino-compatible boards **may work**, but are not officially supported and may require:
- Pin remapping
- Firmware changes
- Different USB behavior

**Tested platform:**
- Arduino Nano (5V)

---

## Required Components

- Arduino Nano
- 5V addressable RGB LEDs (WS2812 / SK6812)
- External 5V power supply (recommended for more than a few LEDs)
- USB cable (Nano ↔ PC)
- Common ground between Arduino and LED power

---

## Wiring

⚠️ **Do not power large LED loads from the Arduino 5V pin.**

### LED Connections

| LED Signal | Arduino Nano |
|-----------|--------------|
| DIN       | **D10** (default data pin) |
| +5V       | External 5V power supply |
| GND       | Common ground |

**Recommended:**
- 330–470Ω resistor in series with the data line
- 1000µF capacitor across +5V and GND near the LED strip

---

## Firmware Installation

1. Install the **Arduino IDE**
2. Open the Nano ARGB firmware project
3. Select board and processor:
    Tools → Board → Arduino Nano
    Tools → Processor → ATmega328P
4. Select the correct port:
    Tools → Port → COM x
5. Click **Upload**

---

## First Boot Behavior

- Device starts with default mode, color, and brightness
- After receiving the first command, the state is stored in EEPROM
- On reboot or power loss, the last used state is restored automatically

---

## PC Software Usage

1. Connect the Arduino Nano to the PC via USB
2. Launch the Nano ARGB desktop application
3. Select the correct serial (COM) port
4. Adjust:
- Color
- Brightness
- Mode

Changes are applied immediately without requiring a device reset.

---

## Serial Communication Notes

- USB Serial only
- One application can control the device at a time
- Designed for low-frequency control commands
- Not intended for screen mirroring or per-frame LED streaming

---

## Using Other Arduino Boards (Experimental)

The firmware may work on:
- Arduino Uno
- Arduino Pro Mini
- Other ATmega328P-compatible boards

You may need to:
- Change the LED data pin
- Adjust serial settings
- Modify the firmware

These setups are **experimental and unsupported**.

---

## Safety Notes

- Always use a proper 5V power supply for LEDs
- Ensure a common ground between Arduino and LEDs
- Avoid hot-plugging large LED loads
- Double-check polarity before powering on

---

## Development Status

- ✔ Core LED control
- ✔ Stable serial protocol
- ✔ EEPROM state persistence
- ❌ HID support (planned)
- ❌ Advanced effects / streaming

---

## License

This project is intended for DIY and educational use.  
