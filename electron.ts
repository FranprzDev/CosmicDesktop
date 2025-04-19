
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const wallpaper = require('wallpaper');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:9002');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on('set-background', async (event, imageUrl) => {
  try {
    await wallpaper.set(imageUrl);
    console.log('Background set successfully');
    event.reply('background-set-success', 'Background set successfully');
  } catch (error) {
    console.error('Failed to set background:', error);
    event.reply('background-set-error', error.message);
  }
});
