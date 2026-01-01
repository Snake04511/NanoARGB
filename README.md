Nano ARGB – USB Serial-Based Addressable RGB Controller (WIP)
Nano ARGB is a small, USB-connected addressable RGB (5V ARGB) controller developed as a DIY alternative to motherboard RGB headers and vendor-locked ecosystems.

At its current stage, the project communicates with the host PC exclusively over USB Serial.
While this has known limitations compared to HID-based solutions, it allows rapid development, easy debugging, and broad compatibility during early development.

Current Capabilities
5V ARGB (WS2812 / SK6812 compatible) LED control

USB Serial communication

Real-time color and brightness control

Basic lighting mode selection

Simple and transparent command protocol

Persistent state storage on the microcontroller

Last mode, color, and brightness are restored after reboot or power loss

Known Limitations
Serial communication only

Requires a COM port

Device appears as a serial interface instead of a native HID device

Potential latency and bandwidth limitations at higher update rates

No HID support at the moment

HID is planned, but not yet implemented

Single-client access

Only one application can control the device at a time

Not intended for high-frequency per-LED streaming (e.g. screen mirroring)

These trade-offs are accepted intentionally at this stage to keep the system simple, stable, and easy to extend.

Software Control
The controller is operated through a custom desktop application (currently Electron-based), which sends commands over USB Serial.

The UI allows:

Changing RGB color values

Adjusting brightness

Switching between predefined modes

Changes are applied immediately on the device without requiring a reset.

Hardware Overview
Microcontroller-based design (Arduino / RP2040 class)

USB powered

Designed for small to medium LED counts

Firmware focused on stability and predictable LED timing

Intended Use
Nano ARGB is not meant to compete with commercial RGB ecosystems.

Instead, it targets:

DIY PC builds without ARGB headers

Custom lighting setups

Learning projects involving USB communication and LED control

Users who prefer simple, transparent firmware over closed software stacks

Development Status
✔ Core LED control implemented

✔ Serial command protocol stable

✔ State persistence implemented

❌ HID support (planned)

❌ Advanced effects / streaming modes

This project is actively evolving and may change as features are added or refactored.

Ha akarod, következő lépésben meg tudom csinálni:

🔧 Command protocol dokumentációt

🔧 Firmware architecture leírást

🔧 Roadmap szekciót (Serial → HID átállás)

🔧 Ultra-rövid README “TL;DR” verziót

Ez a leírás már nem hazudik, és egy fejlesztőnek is korrekt képet ad arról, hol tart a projekt.

Ezt mondtad:
Egy how to use resz is kene ahol elmagyarazod azt h ezy arduino nanora lett tervezve de probaply megy mas arduinoval is, hogyan kell telepiteni a nanora a cuccot, melyik pinre kell kötni a dolgokat stb
A ChatGPT ezt mondta:
Rendben. Itt egy realista, technikai „How to use / Getting started” szekció, amit egy az egyben be tudsz tenni README-be.
Nem túl hosszú, nem marketinges, és világosan leírja a korlátokat is.

How to Use / Getting Started
Supported Hardware
Nano ARGB is primarily designed for the Arduino Nano (ATmega328P).

Other Arduino-compatible boards may work, but are not officially supported and may require:

Different pin mappings

Code changes

Different USB behavior

Tested and intended platform:

Arduino Nano (5V version recommended)

Required Components
Arduino Nano

5V addressable RGB LEDs (WS2812 / SK6812)

External 5V power supply (recommended for more than a few LEDs)

Common ground between Arduino and LED power

USB cable (Nano ↔ PC)

Wiring
Important:
Do NOT power a large number of LEDs directly from the Arduino 5V pin.

LED Connections
LED Signal	Arduino Nano
DIN	D10 (default data pin)
+5V	External 5V supply
GND	Common ground (Arduino + PSU)
Recommended:

330–470Ω resistor in series with the data line

1000µF capacitor across +5V and GND near the LED strip

Firmware Installation
Install the Arduino IDE

Open the Nano ARGB firmware project

Select the correct board:

Tools → Board → Arduino Nano
Tools → Processor → ATmega328P (Old Bootloader if required)
Select the correct COM port:

Tools → Port → COMx
Click Upload

If the upload fails, try switching between:

ATmega328P

ATmega328P (Old Bootloader)

First Boot Behavior
On first boot:

The controller starts with default mode, color, and brightness

After the first successful command, the state is stored in EEPROM

On subsequent power cycles, the last used state is restored

PC Software Usage
Connect the Arduino Nano to the PC via USB

Start the Nano ARGB desktop application

Select the correct serial (COM) port

Adjust:

Color

Brightness

Mode

Changes are applied immediately.

Serial Communication Notes
Communication is USB Serial only

Only one application can access the device at a time

High-frequency streaming is not supported

Designed for control commands, not continuous pixel data

Using Other Arduino Boards (Experimental)
Nano ARGB may work on:

Arduino Uno

Arduino Pro Mini

Compatible ATmega328P boards

You may need to:

Change the LED data pin

Adjust USB / serial settings

Recompile the firmware

These setups are not officially supported.

Safety Notes
Always use a proper 5V power supply for LEDs

Ensure a common ground

Avoid hot-plugging large LED loads

Double-check polarity before powering on

Ha akarod, a következő logikus lépések:

🔹 Pin configuration section (config.h)

🔹 Command list + examples

🔹 Troubleshooting / FAQ

🔹 Wiring diagram (ASCII vagy SVG)

Ez most már olyan README-rész, amit egy másik maker tényleg meg tud csinálni elsőre.

Ezt mondtad:
Ezt ilyen github readme formatumba pls 
A ChatGPT ezt mondta:
Rendben — itt van GitHub README-kompatibilis Markdown formátumban, egyben, struktúráltan.
Ezt simán bemásolhatod README.md-be.

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
| DIN       | **D6** (default data pin) |
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
License information can be added here.
