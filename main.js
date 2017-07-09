const electron = require('electron')
const {
  ipcMain,
  globalShortcut,
  app,
  Tray,
  BrowserWindow,
  dialog,
  shell,
  remote,
  Notification
} = require('electron')
const fs = require('fs')

const child_process = require('child_process')
const ms = require('ms')
const path = require('path')
const url = require('url')
const log = require('electron-log')
const assetsDirectory = path.join(__dirname, 'assets')
const { version } = require('./package')
const osascript = require('node-osascript')
const appDataPath = app.getPath('userData')
const bugsnag = require('bugsnag')
const isDev = require('electron-is-dev')
const countdownDisplay = require('./js/countdown-display')
log.info(`Running version ${version}`)

let releaseStage = isDev ? 'development' : 'production'

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    focusMainWindow()
  }
})
if (shouldQuit) {
  app.quit()
}

const returnFocusOsascript = `tell application "System Events"
	set activeApp to name of application processes whose frontmost is true
	if (activeApp = {"Mobster"} or activeApp = {"Electron"}) then
		tell application "System Events"
      delay 0.25 -- prevent issues when user is still holding down Command for a fraction of a second pressing Cmd+Shift+K shortcut
			key code 48 using {command down}
		end tell
	end if
end tell`

function returnFocusMac() {
  osascript.execute(returnFocusOsascript, function(err, result, raw) {
    if (err) {
      return console.error(err)
    }
    console.log(result, raw)
  })
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let tray

const onMac = /^darwin/.test(process.platform)
const onWindows = /^win/.test(process.platform)

function toggleMainWindow() {
  if (mainWindow.isVisible()) {
    hideMainWindow()
  } else {
    focusMainWindow()
  }
}

let isActive
let secondsRemaining

function onClickTrayIcon() {
  if (isActive === undefined) {
    startCountdown(25)
  } else {
    isActive = !isActive
  }
}

function startCountdown(minutes) {
  isActive = true
  secondsRemaining = 60 * minutes
  tray.setTitle(countdownDisplay.countdownToString(secondsRemaining))
}

function countdown() {
  setTimeout(function() {
    if (isActive && secondsRemaining > 0) {
      secondsRemaining -= 1
      tray.setTitle(countdownDisplay.countdownToString(secondsRemaining))
    }
    countdown()
    if (secondsRemaining === 0) {
      tray.setTitle('')
      notifyTimerFinished()
    }
  }, 1000)
}

function notifyTimerFinished() {
  new Notification({ title: 'You finished your interval! 👌👌👌' }).show()
}

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'tray-icon.png'))
  tray.on('double-click', onClickTrayIcon)
  tray.on('click', onClickTrayIcon)
}

function onReady() {
  createTray()
  registerShortcuts()
  countdown()
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+:', () => {
    startCountdown(5)
  })
  globalShortcut.register('CommandOrControl+"', () => {
    startCountdown(25)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    // app.quit() // TODO: do we want this behavior?
  }
})

function createWindow() {
  // TODO: do stuff
}

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
