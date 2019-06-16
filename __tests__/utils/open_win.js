const { BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')


const mainTemplate = path.join(__dirname, '..', 'assets', 'main.html')
const mainIcon = path.join(__dirname, '..', 'assets', 'main.png')

const EVENT_TO_LOAD_SCRIPT = 'test:event_to_load_script'

module.exports = p => new Promise((resolve, reject) => {
    let win = null;

    win = new BrowserWindow({
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

    win.once('ready-to-show', () => {
        win.show()
        ipcMain.once(`${EVENT_TO_LOAD_SCRIPT}:${win.id}`, (e, d) => {
            if (!!d) {
                resolve(win)
            } else {
                reject(new Error('Unsuccessful ride to open the window and download the script'))
            }
        })
        win.webContents.send(`${EVENT_TO_LOAD_SCRIPT}:${win.id}`, p)
    })

    win.on('error', err => {
        win.close();
        reject(err)
    })
})


module.exports.EVENT_TO_LOAD_SCRIPT = EVENT_TO_LOAD_SCRIPT