const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nano', {
  send(cmd, data) {
    ipcRenderer.send('serial', { cmd, data });
  },

  listPorts() {
    return ipcRenderer.invoke('list-ports');
  },

  connect(port) {
    ipcRenderer.send('connect-port', port);
  },

  minimize() {
    ipcRenderer.send('win-minimize');
  },

  close() {
    ipcRenderer.send('win-close');
  },

  getAutostart() {
    return ipcRenderer.invoke('get-autostart');
  },

  setAutostart(enabled) {
    ipcRenderer.send('set-autostart', enabled);
  },

  onSerialReady(callback) {
    ipcRenderer.on('serial-ready', callback);
  }
});
