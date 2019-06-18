const { BrowserWindow, ipcMain, ipcRenderer, remote } = require('electron')
const isRenderer = require('is-electron-renderer')
const path = require('path')
const url = require('url')


const mainTemplate = path.join(__dirname, '..', 'assets', 'main.html')
const mainIcon = path.join(__dirname, '..', 'assets', 'main.png')

const EVENT_TO_LOAD_SCRIPT = 'test:event_to_load_script'

const ipc = isRenderer ? remote.ipcMain : ipcMain

module.exports = p => new Promise((resolve, reject) => {
    let win = null, BW = null;

    if (isRenderer) {
        if (!remote) return reject(new Error('For the work necessary module remote'))
        BW = remote.BrowserWindow
    } else {
        BW = BrowserWindow
    }


    win = new BW({
        show: false,
        icon: mainIcon, 
        webPreferences: {
            nodeIntegration: true
        }
    })
    

    win.loadURL(url.format({
        protocol: 'file:',
        pathname: mainTemplate, 
        slashes: true
    })) 




    win.once('close', () => {
        win = null
    })

    const rts = () => {
        win.show()
        ipc.once(`${EVENT_TO_LOAD_SCRIPT}:${win.id}`, (e, d) => {
            if (!!d) {
                resolve(win)
            } else {
                reject(new Error('Unsuccessful ride to open the window and download the script'))
            }
        })
        win.webContents.send(`${EVENT_TO_LOAD_SCRIPT}:${win.id}`, p)
    }


    if (isRenderer) {
        ipc.once(`ready-to-show:${win.id}`, rts)
    } else {
        win.once('ready-to-show', rts)
    }

    win.on('error', err => {
        win.close();
        reject(err)
    })
})


module.exports.EVENT_TO_LOAD_SCRIPT = EVENT_TO_LOAD_SCRIPT