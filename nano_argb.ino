#include <EEPROM.h>
#include <FastLED.h>

// ─────────────────────────────
// CONFIG
// ─────────────────────────────
#define LED_PIN 10
#define NUM_LEDS 100
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

CRGB leds[NUM_LEDS];

// EEPROM addresses
#define EEPROM_MODE 0
#define EEPROM_R 1
#define EEPROM_G 2
#define EEPROM_B 3
#define EEPROM_BRIGHTNESS 4
#define EEPROM_SPEED 5

// ─────────────────────────────
// STATE
// ─────────────────────────────
uint8_t mode = 1;           // 1: Static, 2: Rainbow, 3: Breathe, 4: Wave, 5: Strobe, 6: Fire, 7: Spectrum
uint8_t colorR = 255;
uint8_t colorG = 0;
uint8_t colorB = 0;
uint8_t brightness = 180;
uint8_t speed = 50;         // 1-100

unsigned long lastUpdate = 0;
uint8_t rainbowHue = 0;
uint8_t breatheValue = 0;
uint8_t breatheDir = 1;
uint8_t wavePos = 0;
uint8_t strobeState = 0;
uint8_t spectrumHue = 0;

// Serial buffer
uint8_t buffer[10];
uint8_t bufferIdx = 0;

// Function declarations
void effectStatic();
void effectRainbow();
void effectBreathe();
void effectWave();
void effectStrobe();
void effectFire();
void effectSpectrum();

// ─────────────────────────────
// SETUP
// ─────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(100);
  
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(brightness);
  
  loadState();
  applyMode();
  
  FastLED.show();
}

// ─────────────────────────────
// LOOP
// ─────────────────────────────
void loop() {
  parseSerial();
  updateEffect();
  FastLED.show();
}

// ─────────────────────────────
// SERIAL COMMUNICATION
// ─────────────────────────────
void parseSerial() {
  while (Serial.available() > 0) {
    uint8_t byte = Serial.read();
    
    // Kezdete a csomagnak
    if (byte == 0x3C) {
      bufferIdx = 0;
      buffer[bufferIdx++] = byte;
    }
    // Vége a csomagnak
    else if (byte == 0x3E && bufferIdx > 0) {
      processCommand();
      bufferIdx = 0;
    }
    // Adat gyűjtés
    else if (bufferIdx > 0 && bufferIdx < 9) {
      buffer[bufferIdx++] = byte;
    }
  }
}

void processCommand() {
  if (bufferIdx < 2) return;
  
  char cmd = buffer[1];
  
  switch (cmd) {
    case 'M': // Mode <M mode >
      if (bufferIdx >= 3) {
        uint8_t m = buffer[2];
        if (m >= 1 && m <= 7) {
          mode = m;
          saveState();
          applyMode();
        }
      }
      break;
      
    case 'C': // Color <C R G B >
      if (bufferIdx >= 5) {
        colorR = buffer[2];
        colorG = buffer[3];
        colorB = buffer[4];
        saveState();
        applyMode();
      }
      break;
      
    case 'B': // Brightness <B brightness >
      if (bufferIdx >= 3) {
        uint8_t b = buffer[2];
        if (b >= 10 && b <= 255) {
          brightness = b;
          FastLED.setBrightness(brightness);
          saveState();
        }
      }
      break;
      
    case 'S': // Speed <S speed >
      if (bufferIdx >= 3) {
        uint8_t s = buffer[2];
        if (s >= 1 && s <= 100) {
          speed = s;
          saveState();
        }
      }
      break;
  }
}

// ─────────────────────────────
// EFFECTS
// ─────────────────────────────
void updateEffect() {
  // Speed kontrol: 50 = 50ms, 100 = 10ms, 1 = 250ms
  uint16_t delayTime = map(speed, 1, 100, 250, 10);
  
  if (millis() - lastUpdate < delayTime) return;
  lastUpdate = millis();
  
  switch (mode) {
    case 1:
      effectStatic();
      break;
    case 2:
      effectRainbow();
      break;
    case 3:
      effectBreathe();
      break;
    case 4:
      effectWave();
      break;
    case 5:
      effectStrobe();
      break;
    case 6:
      effectFire();
      break;
    case 7:
      effectSpectrum();
      break;
  }
}

void effectStatic() {
  fill_solid(leds, NUM_LEDS, CRGB(colorR, colorG, colorB));
}

void effectRainbow() {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CHSV(rainbowHue + (i * 256 / NUM_LEDS), 255, 255);
  }
  rainbowHue += 2;
}

void effectBreathe() {
  uint8_t brightness_mod = breatheValue;
  
  if (breatheDir) {
    breatheValue += 5;
    if (breatheValue >= 255) breatheDir = 0;
  } else {
    breatheValue -= 5;
    if (breatheValue <= 50) breatheDir = 1;
  }
  
  uint8_t r = (uint16_t)colorR * brightness_mod / 255;
  uint8_t g = (uint16_t)colorG * brightness_mod / 255;
  uint8_t b = (uint16_t)colorB * brightness_mod / 255;
  
  fill_solid(leds, NUM_LEDS, CRGB(r, g, b));
}

void effectWave() {
  for (int i = 0; i < NUM_LEDS; i++) {
    float wave = 0.5 + 0.5 * sin((i + wavePos) * 3.14159 / NUM_LEDS);
    uint8_t brightness_val = 50 + 200 * wave;
    uint8_t r = (uint16_t)colorR * brightness_val / 255;
    uint8_t g = (uint16_t)colorG * brightness_val / 255;
    uint8_t b = (uint16_t)colorB * brightness_val / 255;
    leds[i] = CRGB(r, g, b);
  }
  wavePos++;
}

void effectStrobe() {
  strobeState = !strobeState;
  if (strobeState) {
    fill_solid(leds, NUM_LEDS, CRGB(colorR, colorG, colorB));
  } else {
    fill_solid(leds, NUM_LEDS, CRGB(0, 0, 0));
  }
}

void effectFire() {
  for (int i = 0; i < NUM_LEDS; i++) {
    uint8_t flicker = random(150, 255);
    leds[i] = CRGB(255, random(100, flicker), 0);
  }
}

void effectSpectrum() {
  fill_solid(leds, NUM_LEDS, CHSV(spectrumHue, 255, 255));
  spectrumHue++;
}

void applyMode() {
  rainbowHue = 0;
  breatheValue = 50;
  breatheDir = 1;
  wavePos = 0;
  strobeState = 0;
  spectrumHue = 0;
}

// ─────────────────────────────
// EEPROM
// ─────────────────────────────
void saveState() {
  EEPROM.write(EEPROM_MODE, mode);
  EEPROM.write(EEPROM_R, colorR);
  EEPROM.write(EEPROM_G, colorG);
  EEPROM.write(EEPROM_B, colorB);
  EEPROM.write(EEPROM_BRIGHTNESS, brightness);
  EEPROM.write(EEPROM_SPEED, speed);
}

void loadState() {
  mode = EEPROM.read(EEPROM_MODE);
  if (mode == 0 || mode > 7) mode = 1;
  
  colorR = EEPROM.read(EEPROM_R);
  colorG = EEPROM.read(EEPROM_G);
  colorB = EEPROM.read(EEPROM_B);
  
  brightness = EEPROM.read(EEPROM_BRIGHTNESS);
  if (brightness == 0 || brightness > 255) brightness = 180;
  
  speed = EEPROM.read(EEPROM_SPEED);
  if (speed == 0 || speed > 100) speed = 50;
  
  FastLED.setBrightness(brightness);
}
