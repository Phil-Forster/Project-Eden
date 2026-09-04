'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pacificDrive', {
  getAppMeta: () => ipcRenderer.invoke('app:meta'),
  getDashboard: () => ipcRenderer.invoke('dashboard:get'),
  refreshDashboard: () => ipcRenderer.invoke('dashboard:refresh'),
  openGameFolder: () => ipcRenderer.invoke('folder:open-game'),
  openSaveFolder: () => ipcRenderer.invoke('folder:open-save'),
  selectSave: (key) => ipcRenderer.invoke('save:select', key),
  browseSaveFolder: () => ipcRenderer.invoke('save:browse'),
  notifyReady: () => ipcRenderer.send('ui:ready'),
  onDashboardUpdated: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, data) => callback(data);
    ipcRenderer.on('dashboard-updated', listener);
    return () => ipcRenderer.removeListener('dashboard-updated', listener);
  }
});
