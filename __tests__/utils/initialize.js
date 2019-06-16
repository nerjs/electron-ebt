const ir = require('is-electron-renderer')
const { ipcMain, ipcRenderer } = require('electron')
const path = require('path')

const openWin = require('../utils/open_win')
const EBT = require('../../lib/ebt')


const checkInit = (sender, listener, name, msg) => {
    const ebt = new EBT();
    expect(() => {
        ebt.initialize({sender, listener, name})
    }).toThrow(msg)
}

module.exports = () => {
    test('check initialize', () => {
        checkInit(undefined, undefined, undefined, 'data[undefined] has invalid type')
        checkInit({}, {}, undefined, `data[${{}}], missing property[send]`)
        checkInit({send:true}, {}, undefined, `data[${{}}], missing property[on]`)
        checkInit({send:true}, {on:true}, undefined, `data[${{}}], missing property[once]`)
        checkInit({send:true}, {on:true, once: true}, undefined, `data[${{}}], missing property[removeAllListeners]`)
        checkInit({send:true}, {on:true, once: true, removeAllListeners:true}, undefined, `data[undefined] has invalid type`)
        checkInit({send:true}, {on:true, once: true, removeAllListeners:true}, 1, `data[1] does not match the type[string]`)
    })

    test('correct initialization', async () => {
        const ebt = new EBT();
        let sender, listener, name = 'test';
        if (ir) {
            sender = ipcRenderer;
            listener = ipcRenderer;
        } else {
            const win = await openWin(path.join(__dirname, 'tr_script.js'))
            listener = ipcMain
            sender = win.webContents
        }


        ebt.initialize({ sender, listener, name })
        expect(ebt.ipcSender).toEqual(sender)
        expect(ebt.ipcListener).toEqual(listener)
        expect(ebt.eventName).toEqual(name)
    })
}
