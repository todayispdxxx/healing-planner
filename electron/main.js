const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage, shell } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let tray = null

// 窗口状态持久化
const userDataPath = app.getPath('userData')
const windowStatePath = path.join(userDataPath, 'window-state.json')

function loadWindowState() {
  try {
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf8'))
    }
  } catch (e) { /* ignore */ }
  return { width: 1200, height: 800, x: undefined, y: undefined, isMaximized: false }
}

function saveWindowState() {
  if (!mainWindow) return
  try {
    const bounds = mainWindow.getBounds()
    const isMaximized = mainWindow.isMaximized()
    const state = { ...bounds, isMaximized }
    fs.writeFileSync(windowStatePath, JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

function createWindow() {
  const windowState = loadWindowState()

  mainWindow = new BrowserWindow({
    width: windowState.width || 1200,
    height: windowState.height || 800,
    x: windowState.x,
    y: windowState.y,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#FFF9F0',
    show: false,
    icon: path.join(__dirname, '../public/icon.png')
  })

  // 窗口准备好后显示，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    if (windowState.isMaximized) {
      mainWindow.maximize()
    }
    mainWindow.show()
  })

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口关闭时保存状态
  mainWindow.on('close', () => {
    saveWindowState()
  })

  // 最小化到托盘
  mainWindow.on('minimize', (e) => {
    e.preventDefault()
    mainWindow.hide()
  })
}

// 创建托盘
function createTray() {
  // 使用默认图标，如果没有自定义图标
  let trayIcon
  const iconPath = path.join(__dirname, '../public/icon.png')
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath)
  } else {
    // 创建一个简单的16x16图标
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('治愈计划 - 智能计划管理')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🌸 打开治愈计划',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: '📝 快速添加任务',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('navigate', '/input')
      }
    },
    { type: 'separator' },
    {
      label: '💡 关于',
      click: () => {
        shell.openExternal('https://github.com/healing-planner')
      }
    },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    } else {
      mainWindow.show()
    }
  })
})

// 确保托盘关闭时才真正退出
app.on('before-quit', () => {
  app.isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// === IPC 通信 ===
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.hide() // 最小化到托盘
})

ipcMain.on('window-maximize', () => {
  if (!mainWindow) return
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide() // 关闭到托盘
})

ipcMain.on('window-quit', () => {
  app.isQuitting = true
  app.quit()
})

ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show()
  }
})

// 获取是否最大化状态
ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

// 开机自启
ipcMain.on('set-auto-launch', (event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe')
  })
})

ipcMain.handle('get-auto-launch', () => {
  const settings = app.getLoginItemSettings()
  return settings.openAtLogin
})
