const { app, BrowserWindow, dialog, shell } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

// `npm run dev`: load the Vite dev server; you run fe-vnc and be-vnc yourself.
const isDev = process.argv.includes('--dev')
const DEV_URL = 'http://localhost:5173'

// Packaged builds copy the backend and frontend into the app's resources folder
// (see "extraResources" in package.json); unpackaged runs use the sibling projects.
const backendDir = app.isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, '..', 'be-vnc')
const frontendDir = app.isPackaged
  ? path.join(process.resourcesPath, 'frontend')
  : path.join(__dirname, '..', 'fe-vnc', 'dist')

const CONFIG_TEMPLATE = `# VNC settings. Fill in your MySQL details, then start VNC again.
PORT=4000
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE"
`

// Installed apps read settings from the user's app-data folder; unpackaged runs
// reuse be-vnc/.env so developers keep a single file.
function loadConfig() {
  const configPath = app.isPackaged
    ? path.join(app.getPath('userData'), '.env')
    : path.join(backendDir, '.env')

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, CONFIG_TEMPLATE)
    return { configPath, isNew: true }
  }

  require(path.join(backendDir, 'node_modules', 'dotenv')).config({
    path: configPath,
    quiet: true,
  })
  return { configPath, isNew: false }
}

function startBackend(port) {
  process.env.FRONTEND_DIR = frontendDir
  const { default: server } = require(path.join(backendDir, 'dist', 'app.js'))

  // Bind to loopback only so the API is not reachable from the network.
  return new Promise((resolve, reject) => {
    const listener = server.listen(port, '127.0.0.1', (err) =>
      err ? reject(err) : resolve(listener),
    )
  })
}

function createWindow(url) {
  const win = new BrowserWindow({ width: 1280, height: 800 })
  win.loadURL(url)

  // Open target="_blank" links in the user's browser, not a new app window.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target)
    return { action: 'deny' }
  })
}

async function showFirstRunDialog(configPath) {
  const { response } = await dialog.showMessageBox({
    type: 'info',
    title: 'VNC setup',
    message: 'Connect VNC to your MySQL database',
    detail: `A settings file was created at:\n${configPath}\n\nAdd your MySQL details to it, save, then start VNC again.`,
    buttons: ['Open settings file', 'Quit'],
    defaultId: 0,
  })
  if (response === 0) await shell.openPath(configPath)
}

// A second copy would fight over the same port, so focus the first one instead.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows()
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  app.whenReady().then(async () => {
    if (isDev) return createWindow(DEV_URL)

    const { configPath, isNew } = loadConfig()
    if (isNew) {
      await showFirstRunDialog(configPath)
      return app.quit()
    }

    const port = Number(process.env.PORT) || 4000
    try {
      await startBackend(port)
    } catch (err) {
      dialog.showErrorBox(
        'VNC could not start',
        `${err.message}\n\nCheck your settings in:\n${configPath}`,
      )
      return app.quit()
    }

    createWindow(`http://127.0.0.1:${port}`)
  })

  // The backend lives in this process, so closing the window ends the app on
  // every platform (including macOS).
  app.on('window-all-closed', () => app.quit())
}
