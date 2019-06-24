const ir = require('is-electron-renderer')
const { ipcRenderer } = require('electron')
const ipcMain = require('nerjs-utils/electron/ipc_main')
const path = require('path')
const openWinScript = require('nerjs-utils/electron/tests/open_win_script')

const EBT = require('../../lib/ebt')

module.exports = () => {
    test('check initialize', () => {

        const checkInit = (sender, listener, name, msg) => {
            const ebt = new EBT();
            expect(() => {
                ebt.initialize({sender, listener, name})
            }).toThrow(msg)
        }
        checkInit(undefined, undefined, undefined, 'data[undefined] has invalid type')
        checkInit({}, {}, undefined, `data[${{}}], missing property[send]`)
        checkInit({send:true}, {}, undefined, `data[${{}}], missing property[on]`)
        checkInit({send:true}, {on:true}, undefined, `data[${{}}], missing property[once]`)
        checkInit({send:true}, {on:true, once: true}, undefined, `data[${{}}], missing property[removeListener]`)
        checkInit({send:true}, {on:true, once: true, removeListener:true}, undefined, `data[undefined] has invalid type`)
        checkInit({send:true}, {on:true, once: true, removeListener:true}, 1, `data[1] does not match the type[string]`)
    })

    test('correct initialization', async () => {
        const ebt = new EBT();
        let sender, listener, 
            name = 'test', 
            win;
        if (ir) {
            sender = ipcRenderer;
            listener = ipcRenderer;
        } else {
            try {
               win = await openWinScript(path.join(__dirname, 'tr_script.js')) 
            } catch(e) {
                console.log(e)
            }
            
            listener = ipcMain
            sender = win.webContents
        }


        ebt.initialize({ sender, listener, name })
        expect(ebt.ipcSender).toEqual(sender)
        expect(ebt.ipcListener).toEqual(listener)
        expect(ebt.eventName).toEqual(name)

        ebt.reinitialize()
        expect(ebt.ipcSender).toEqual(null)
        expect(ebt.ipcListener).toEqual(null)
        expect(ebt.eventName).toEqual(null)


        if (win) win.destroy()
    })
}
