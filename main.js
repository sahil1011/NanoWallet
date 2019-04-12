const { app, BrowserWindow, shell, Menu, protocol, webFrame, ipcMain } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const url = require('url');
const path = require('path');



app.setAsDefaultProtocolClient('xrb'); 

console.log(`Starting ledger@!`);

const ledger = require('./desktop-app/src/lib/ledger');

ledger.initialize();


let mainWindow;



function createWindow () {
 
  mainWindow = new BrowserWindow({width: 1000, height: 600, webPreferences: { webSecurity: false } });

  mainWindow.loadURL('http://localhost:4200/');
 
  mainWindow.on('closed', function () {

    mainWindow = null
  });

  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  const menuTemplate = getApplicationMenu();

  
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

app.on('ready', () => {

  createWindow();

 
  app.on('open-url', (event, path) => {
    if (!mainWindow) {
      createWindow();
    }
    if (!mainWindow.webContents.isLoading()) {
      mainWindow.webContents.executeJavaScript(`window.dispatchEvent(new CustomEvent('protocol-load', { detail: '${path}' }));`);
    }
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`window.dispatchEvent(new CustomEvent('protocol-load', { detail: '${path}' }));`);
    });
    event.preventDefault();
  });

 
  checkForUpdates();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
 
  if (mainWindow === null) {
    createWindow()
  }
});

function checkForUpdates() {
 
}

function getApplicationMenu() {
  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'View GitHub',
          click () { loadExternal('https://blockchain-wallet.herokuapp.com') }
        },
        {
          label: 'Submit Issue',
          click () { loadExternal('https://blockchain-wallet.herokuapp.com') }
        },
        {type: 'separator'},
        {
          type: 'normal',
          label: `Blockchain-wallet Version: ${autoUpdater.currentVersion}`,
        },
        {
          label: 'View Latest Updates',
          click () { loadExternal('https://blockchain-wallet.herokuapp.com') }
        },
        {type: 'separator'},
        {
          label: `Check for Updates...`,
          click (menuItem, browserWindow) {
            checkForUpdates();
          }
        },
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'BlockchainWallet',
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {
          label: `Check for Updates...`,
          click (menuItem, browserWindow) {
            checkForUpdates();
          }
        },
        {type: 'separator'},
        // {role: 'services', submenu: []},
        // {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    });

    // Edit menu
    template[1].submenu.push(
      {type: 'separator'},
      {
        label: 'Speech',
        submenu: [
          {role: 'startspeaking'},
          {role: 'stopspeaking'}
        ]
      }
    );

    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ];
  }

  return template;
}

function loadExternal(url) {
  shell.openExternal(url);
}
