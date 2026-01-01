const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const { SerialPort } = require('serialport');
const si = require('systeminformation');
const path = require('path');

const DEFAULT_PORT = 'COM10';
const BAUD = 115200;

let win;
let tray;
let port = null;
let startHidden = false;

// Single instance lock - megakadályozza az alkalmazás többszöri megnyitását
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// ─────────────────────────────
// WINDOW
// ─────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 520,
    frame: false,
    backgroundColor: '#050707',
    icon: path.join(__dirname, 'nano_argb.ico'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  if (!startHidden) {
    win.show();
  }

  win.on('close', (e) => {
    e.preventDefault();
    win.hide();
  });
}

// ─────────────────────────────
// SERIAL
// ─────────────────────────────
function connectPort(portName) {
  try {
    if (port && port.isOpen) port.close();
    port = new SerialPort({ path: portName, baudRate: BAUD });
    
    port.on('open', () => {
      console.log('Port opened:', portName);
      // Arduino boot után várunk több ideig
      setTimeout(() => {
        if (win && win.webContents) {
          console.log('Sending serial-ready');
          win.webContents.send('serial-ready');
        }
      }, 1500);
    });
    
    console.log('Connected to', portName);
  } catch (e) {
    console.log('Failed to connect', portName);
  }
}

function autoConnect() {
  const tryConnect = async () => {
    const ports = await SerialPort.list();
    const found = ports.find(p => p.path === DEFAULT_PORT);
    if (found) {
      connectPort(DEFAULT_PORT);
      console.log('Auto-connected to', DEFAULT_PORT);
    } else {
      setTimeout(tryConnect, 1000);
    }
  };
  tryConnect();
}

// ─────────────────────────────
// APP READY
// ─────────────────────────────
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.show();
  }
});

app.whenReady().then(() => {
  // Ellenőrizzük, hogy autostart-tal indult-e
  if (app.getLoginItemSettings().openAtLogin) {
    startHidden = true;
  }

  createWindow();
  autoConnect();

  tray = new Tray(path.join(__dirname, 'nano_argb.ico'));
  tray.setToolTip('Nano ARGB Matrix');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Exit', click: () => {
      if (port && port.isOpen) port.close();
      app.quit();
    }}
  ]));
});

app.on('before-quit', () => {
  if (port && port.isOpen) port.close();
  if (tray) tray.destroy();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

// ─────────────────────────────
// IPC
// ─────────────────────────────
ipcMain.handle('list-ports', async () => {
  await new Promise(r => setTimeout(r, 300));
  const ports = await SerialPort.list();
  return ports.map(p => p.path);
});

ipcMain.on('connect-port', (_, portName) => {
  connectPort(portName);
});

ipcMain.on('serial', (_, { cmd, data }) => {
  if (!port || !port.writable) return;

  const packet = Buffer.from([
    0x3C,
    cmd.charCodeAt(0),
    ...data,
    0x3E
  ]);

  // Háromszor elküldjük a parancsot
  let attempt = 0;
  const send = () => {
    if (attempt < 3) {
      port.write(packet);
      attempt++;
      setTimeout(send, 100);
    }
  };
  send();
});

ipcMain.on('win-minimize', () => win.minimize());
ipcMain.on('win-close', () => win.hide());

ipcMain.handle('get-autostart', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('set-autostart', (_, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled
  });
});
