// ─────────────────────────────
// STATE
// ─────────────────────────────
let userInteracted = false;
let syncTimer = null;
let cpuTemp = { main: 0, max: 0 };

let state = {
  mode: 1,
  color: [0, 255, 136],
  brightness: 180,
  speed: 50
};

const modeNames = ['', 'STATIC', 'RAINBOW', 'BREATHE', 'WAVE', 'STROBE', 'FIRE', 'SPECTRUM'];

// ─────────────────────────────
// AUTOSTART
// ─────────────────────────────
async function initAutostart() {
  const enabled = await window.nano.getAutostart();
  document.getElementById('autostartToggle').checked = enabled;
}

function toggleAutostart() {
  const checkbox = document.getElementById('autostartToggle');
  window.nano.setAutostart(checkbox.checked);
}

// ─────────────────────────────
// SYNC HELPER
// ─────────────────────────────
function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  
  syncTimer = setTimeout(() => {
    if (userInteracted && window.nano) {
      window.nano.send('M', [state.mode]);
      window.nano.send('C', state.color);
      window.nano.send('B', [state.brightness]);
    }
    syncTimer = null;
  }, 300);
}

// ─────────────────────────────
// CUSTOM COLOR PICKER
// ─────────────────────────────
let pickerTempColor = [0, 0, 0];
let colorWheelCanvas = null;
let colorWheelCtx = null;
let isUpdatingFromWheel = false;

function initColorWheel() {
  colorWheelCanvas = document.getElementById('colorWheel');
  
  // Canvas méretének beállítása
  colorWheelCanvas.width = 200;
  colorWheelCanvas.height = 200;
  
  colorWheelCtx = colorWheelCanvas.getContext('2d');
  
  drawColorWheel();
  
  // Remove old listeners ha vannak
  const newCanvas = colorWheelCanvas.cloneNode(true);
  colorWheelCanvas.parentNode.replaceChild(newCanvas, colorWheelCanvas);
  colorWheelCanvas = newCanvas;
  colorWheelCtx = colorWheelCanvas.getContext('2d');
  drawColorWheel();
  
  // Új listeners
  const handlePointer = (e) => {
    isUpdatingFromWheel = true;
    pickColorFromWheel(e);
    isUpdatingFromWheel = false;
  };
  
  colorWheelCanvas.addEventListener('mousedown', handlePointer);
  colorWheelCanvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
      handlePointer(e);
    }
  });
}

function drawColorWheel() {
  const w = colorWheelCanvas.width;
  const h = colorWheelCanvas.height;
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) / 2 - 2;
  
  const imageData = colorWheelCtx.createImageData(w, h);
  const data = imageData.data;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      let hue = (angle + Math.PI) / (2 * Math.PI) * 360;
      let saturation = Math.min(distance / radius, 1) * 100;
      let lightness = 50;
      
      if (distance > radius) {
        // Külső terület - átlátszó
        data[(y * w + x) * 4 + 3] = 0;
      } else {
        const rgb = hslToRgb(hue, saturation, lightness);
        data[(y * w + x) * 4] = rgb.r;
        data[(y * w + x) * 4 + 1] = rgb.g;
        data[(y * w + x) * 4 + 2] = rgb.b;
        data[(y * w + x) * 4 + 3] = 255;
      }
    }
  }
  
  colorWheelCtx.putImageData(imageData, 0, 0);
}

function pickColorFromWheel(e) {
  const rect = colorWheelCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const w = colorWheelCanvas.width;
  const h = colorWheelCanvas.height;
  const centerX = w / 2;
  const centerY = h / 2;
  const radius = Math.min(w, h) / 2 - 2;
  
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= radius) {
    const angle = Math.atan2(dy, dx);
    let hue = (angle + Math.PI) / (2 * Math.PI) * 360;
    let saturation = (distance / radius) * 100;
    
    const rgb = hslToRgb(hue, saturation, 50);
    pickerTempColor = [rgb.r, rgb.g, rgb.b];
    
    // Frissítsd a slidereket
    document.getElementById('sliderR').value = rgb.r;
    document.getElementById('sliderG').value = rgb.g;
    document.getElementById('sliderB').value = rgb.b;
    
    document.getElementById('valueR').textContent = rgb.r;
    document.getElementById('valueG').textContent = rgb.g;
    document.getElementById('valueB').textContent = rgb.b;
    
    updateColorPickerPreview();
  }
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r, g, b;
  
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function openColorPicker() {
  pickerTempColor = [...state.color];
  document.getElementById('sliderR').value = state.color[0];
  document.getElementById('sliderG').value = state.color[1];
  document.getElementById('sliderB').value = state.color[2];
  updateColorPickerPreview();
  document.getElementById('colorPickerModal').classList.add('active');
  initColorWheel();
}

function closeColorPicker() {
  document.getElementById('colorPickerModal').classList.remove('active');
}

function updateColorPickerFromSliders() {
  if (isUpdatingFromWheel) return;
  
  pickerTempColor = [
    parseInt(document.getElementById('sliderR').value),
    parseInt(document.getElementById('sliderG').value),
    parseInt(document.getElementById('sliderB').value)
  ];
  
  document.getElementById('valueR').textContent = pickerTempColor[0];
  document.getElementById('valueG').textContent = pickerTempColor[1];
  document.getElementById('valueB').textContent = pickerTempColor[2];
  
  updateColorPickerPreview();
}

function updateColorPickerPreview() {
  const [r, g, b] = pickerTempColor;
  const color = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('colorPickerPreview').style.background = color;
}

function applyColorPicker() {
  const [r, g, b] = pickerTempColor;
  
  state.color = [r, g, b];
  
  const hex = '#' + [r, g, b]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  
  colorPicker.value = hex;
  saveState();
  updatePreview();
  scheduleSync();
  
  closeColorPicker();
}

function updateColorDisplay() {
  const [r, g, b] = state.color;
  const color = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('colorDisplay').style.background = color;
}

// Close modal on background click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('colorPickerModal');
  if (e.target === modal) {
    closeColorPicker();
  }
});

// ─────────────────────────────
// SETTINGS MODAL
// ─────────────────────────────
function toggleSettings() {
  const modal = document.getElementById('settingsModal');
  modal.classList.toggle('active');
}

// Close modal on background click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('settingsModal');
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// ─────────────────────────────
// SAFETY GATE
// ─────────────────────────────
function send(cmd, data) {
  if (!userInteracted) return;
  window.nano.send(cmd, data);
}

// első valódi user interakció
document.addEventListener('pointerdown', () => {
  userInteracted = true;
}, { once: true });

// ─────────────────────────────
// PREVIEW UPDATE
// ─────────────────────────────
function updatePreview() {
  const cube = document.getElementById('previewCube');
  const modeLabel = document.getElementById('previewMode');
  const rgbLabel = document.getElementById('previewRGB');
  
  const [r, g, b] = state.color;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  
  cube.style.background = rgb;
  modeLabel.textContent = modeNames[state.mode];
  rgbLabel.textContent = `RGB: ${r}, ${g}, ${b}`;
}

// ─────────────────────────────
// MODE
// ─────────────────────────────
function setMode(m) {
  userInteracted = true;
  state.mode = m;
  
  // Visual feedback
  document.querySelectorAll('.mode-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === m);
  });
  
  saveState();
  updatePreview();
  scheduleSync();
}

// ─────────────────────────────
// COLOR
// ─────────────────────────────
const colorPicker = document.getElementById('color');

colorPicker.addEventListener('input', e => {
  const rgb = e.target.value
    .match(/\w\w/g)
    .map(x => parseInt(x, 16));

  state.color = rgb;
  saveState();
  updatePreview();
  scheduleSync();
});

function setColorQuick(r, g, b) {
  userInteracted = true;
  state.color = [r, g, b];
  
  const hex = '#' + [r, g, b]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  
  colorPicker.value = hex;
  saveState();
  updatePreview();
  scheduleSync();
}

// ─────────────────────────────
// BRIGHTNESS
// ─────────────────────────────
const brightnessSlider = document.getElementById('brightness');

brightnessSlider.addEventListener('input', e => {
  state.brightness = parseInt(e.target.value);
  saveState();
  scheduleSync();
});

// ─────────────────────────────
// SPEED
// ─────────────────────────────
const speedSlider = document.getElementById('speed');

speedSlider.addEventListener('input', e => {
  state.speed = parseInt(e.target.value);
  saveState();
  scheduleSync();
});

// ─────────────────────────────
// PORTS
// ─────────────────────────────
async function loadPorts() {
  const ports = await window.nano.listPorts();
  const sel = document.getElementById('ports');
  sel.innerHTML = '';

  ports.forEach(p => {
    const o = document.createElement('option');
    o.value = p;
    o.textContent = p;
    if (p === 'COM10') o.selected = true;
    sel.appendChild(o);
  });
}

function connect() {
  const sel = document.getElementById('ports');
  window.nano.connect(sel.value);
}

// ─────────────────────────────
// STATE PERSISTENCE
// ─────────────────────────────
function saveState() {
  localStorage.setItem('nanoState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('nanoState');
  if (!saved) return;

  state = JSON.parse(saved);

  // UI frissítés, SERIAL NÉLKÜL
  colorPicker.value =
    '#' + state.color.map(v => v.toString(16).padStart(2,'0')).join('');
  brightnessSlider.value = state.brightness;
  speedSlider.value = state.speed;
  
  // Mode button state
  document.querySelectorAll('.mode-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === state.mode);
  });
  
  updatePreview();
}

// ─────────────────────────────
// SERIAL READY (PRELOAD-BÓL)
// ─────────────────────────────
window.nano.onSerialReady(() => {
  // itt SZÁNDÉKOSAN küldünk
  window.nano.send('M', [state.mode]);
  window.nano.send('C', state.color);
  window.nano.send('B', [state.brightness]);
  window.nano.send('S', [state.speed]);
});

// ─────────────────────────────
// AUTOSTART
// ─────────────────────────────
async function initAutostart() {
  const enabled = await window.nano.getAutostart();
  document.getElementById('autostartToggle').checked = enabled;
}

function toggleAutostart() {
  const checkbox = document.getElementById('autostartToggle');
  window.nano.setAutostart(checkbox.checked);
}

// ─────────────────────────────
// THEME
// ─────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('light-theme', !isDark);
  document.getElementById('themeToggle').checked = !isDark;
  document.getElementById('themeLabel').textContent = isDark ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const checkbox = document.getElementById('themeToggle');
  setTheme(checkbox.checked ? 'light' : 'dark');
}

// ─────────────────────────────
// INIT
// ─────────────────────────────
loadPorts();
loadState();
initAutostart();
initTheme();
