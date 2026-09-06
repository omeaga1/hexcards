const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,

  // LCU Bridge Triggers
  checkChampSelect: () => ipcRenderer.invoke("lcu:checkChampSelect"),
  importItemSet: (itemSet) => ipcRenderer.invoke("lcu:importItemSet", itemSet),
  importRunes: (runePage) => ipcRenderer.invoke("lcu:importRunes", runePage),
  checkBridgeStatus: () => ipcRenderer.invoke("lcu:getStatus"),

  // Auto-Updater
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("update:status", handler);
    return () => ipcRenderer.removeListener("update:status", handler);
  },
  checkForUpdates: () => ipcRenderer.invoke("update:checkForUpdates"),
  installUpdate: () => ipcRenderer.send("update:installNow"),

  // Window Controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggleAlwaysOnTop")
});
