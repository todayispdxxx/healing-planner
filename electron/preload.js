const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  quitWindow: () => ipcRenderer.send('window-quit'),
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  setAutoLaunch: (enabled) => ipcRenderer.send('set-auto-launch', enabled),
  getAutoLaunch: () => ipcRenderer.invoke('get-auto-launch'),
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, path) => callback(path))
})
