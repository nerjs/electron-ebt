const { ipcMain, ipcRenderer } = require('electron')
const isRenderer = require('is-electron-renderer')
const EventEmitter = require('events')

const checkArgs = require('./utils/check_args')
const parseArgs = require('./utils/parse_args')




class EBT extends EventEmitter {
    initialize(data) {
        const { sender, listener, name } = parseArgs(data, {
            name: `${process.pid}`, 
            sender: isRenderer ? ipcRenderer : undefined,
            listener: isRenderer ? ipcRenderer : ipcMain
        })
        checkArgs(sender, 'object', ['send'])
        checkArgs(listener, 'object', ['on', 'once', 'removeAllListeners'])
        checkArgs(name, 'string')

        this.ipcSender = sender;
        this.ipcListener = listener;
        this.eventName = name;

        this.emit('initialize')
    }

    reinitialize() {
        
        this.emit('reinitialize')
    }
}


module.exports = EBT
