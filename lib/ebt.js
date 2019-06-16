const { ipcMain, ipcRenderer } = require('electron')
const isRenderer = require('is-electron-renderer')
const EventEmitter = require('events')

const checkArgs = require('./utils/check_args')
const parseArgs = require('./utils/parse_args')
const EBTEvent = require('./utils/event_message')

console.log(EventEmitter)


class EBT extends EventEmitter {
    initialize(data) {
        const { sender, listener, name } = parseArgs(data, {
            name: `message:${process.pid}`, 
            sender: isRenderer ? ipcRenderer : undefined,
            listener: isRenderer ? ipcRenderer : ipcMain
        })
        checkArgs(sender, 'object', ['send'])
        checkArgs(listener, 'object', ['on', 'once', 'removeListener'])
        checkArgs(name, 'string')

        this.ipcSender = sender;
        this.ipcListener = listener;
        this.eventName = name;

        const handler = (e, d) => this.parseEvent(e, d)
        this.ipcListener.on(this.eventName, handler)
        this.once('reinitialize', () => {
            if (!listener) return;
            listener.removeListener(name, handler)
        })
        this.emit('initialize')
    }

    reinitialize() {
        
        this.ipcSender = null;
        this.ipcListener = null;
        this.eventName = null;
        this.emit('reinitialize')
    }

    parseEvent(e, _data) {

    }

    send(name, data) {

    }
}


module.exports = EBT
