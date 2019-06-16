const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const ebt = require('../lib/ebt')


const mainTemplate = path.join(__dirname, 'main.html')
const mainIcon = path.join(__dirname, 'assets', 'main.png')

// console.log(ebt);
// (new ebt()).initialize({send:1},ipcMain, '1')

const devTools = _win => {

    const dtRegister = win => () => {
        if (!win.isFocused()) return;
        if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools()
        } else {
            win.webContents.openDevTools()
        }
    }
    win.on('focus', () => {
        globalShortcut.register('F12', dtRegister(_win))
    })
    win.on('blur', () => {
        globalShortcut.unregister('F12')
    })
}



app.on('window-all-closed', () => {
    app.quit()
  })


let win = null;

app.on('ready', () => {
    console.log('Ready main process')
    win = new BrowserWindow({
        width: 800,
        height: 500,
        show: false,
        fullscreenWindowTitle: true,
        // autoHideMenuBar: true, 
        icon: mainIcon, 
        webPreferences: {
            devTools: true,
            nodeIntegration: true
        }
    })
    

    win.loadURL(url.format({
        protocol: 'file:',
        pathname: mainTemplate, 
        slashes: true
    })) 

    devTools(win)




    win.once('close', () => {
        win = null
    })

    win.once('ready-to-show', () => {
        console.log('ready-to-show')
        win.show()
        win.maximize()
    })

    win.on('error', console.log)
})