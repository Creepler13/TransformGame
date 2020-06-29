const { app, BrowserWindow } = require('electron')
var win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  })
  

  // and load the index.html of the app.
  win.loadFile('index.html')
  win.webContents.openDevTools();

}

app.whenReady().then(createWindow)

