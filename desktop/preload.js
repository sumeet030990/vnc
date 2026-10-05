const { contextBridge, ipcRenderer } = require('electron')

// The small set of desktop features the web page may use (see main.js).
contextBridge.exposeInMainWorld('vncDesktop', {
  // Only macOS has a share menu that Electron can open.
  canSharePdf: process.platform === 'darwin',
  // Opens the share menu with this PDF attached. `bytes` is a Uint8Array.
  sharePdf: (fileName, bytes) =>
    ipcRenderer.invoke('share-pdf', fileName, bytes),
})
