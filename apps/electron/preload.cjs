const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getNotesFolder: () => ipcRenderer.invoke('notes:get-folder'),
  selectNotesFolder: () => ipcRenderer.invoke('notes:select-folder'),
  loadNotes: () => ipcRenderer.invoke('notes:load'),
  saveNotes: (notes) => ipcRenderer.invoke('notes:save', notes),
});
