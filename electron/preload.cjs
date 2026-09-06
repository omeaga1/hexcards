const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,

  // LCU Bridge Triggers
  checkChampSelect: () => ipcRenderer.invoke("lcu:checkChampSelect"),
  importItemSet: (itemSet) => ipcRenderer.invoke("lcu:importItemSet", itemSet),
  importRunes: (runePage) => ipcRenderer.invoke("lcu:importRunes", runePage),
  checkBridgeStatus: () => ipcRenderer.invoke("lcu:getStatus"),

  // Window Controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggleAlwaysOnTop")
});
