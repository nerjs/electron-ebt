const path = require('path')
const ipcMain = require('nerjs-utils/electron/ipc_main')
const openWinScript = require('nerjs-utils/electron/tests/open_win_script')

const EBT = require('../../lib/ebt')

const script = path.join(__dirname, 'sender_script.js')

module.exports = () => {
    let win, ebt, init;

    beforeAll(async () => {
        win = await openWinScript(script)
        const name = `test:${win.id}`,
            sender = win.webContents,
            listener = ipcMain;
        
        ebt = new EBT()
        init = { name, sender, listener }
        ebt.initialize(init)
    })

    afterAll(() => {
        ebt.reinitialize()
        win.close()
        win = null;
    })


    test('prevent sending an event', async () => {

        await expect(await ebt.send('test1')).toEqual({a:1})
        
        ebt.once('pre:test1', e => e.preventDefault())

        await expect(ebt.send('test1')).rejects.toThrow('Event test1 has been prevented')

        await expect(await ebt.send('test1')).toEqual({a:1})

        ebt.once('pre:test1', e => e.setResult(new Error('_test_')))
        await expect(ebt.send('test1')).rejects.toThrow('_test_')
    })

    test('Data transfer', async () => {
        expect(await ebt.send('test2', { test2: 1 })).toEqual({test2:1})
        expect(await ebt.send('test3', { test3: 2 })).toEqual({test3: 2})
    })


    test('result', async () => {
        expect(await ebt.send('test4')).toEqual({ a: 1, b: 3, c: 4})
        expect(await ebt.send('test5')).toEqual({ a: 1, b: 3, c: 4, d: 5, e: 6})

        await expect(ebt.send('test6')).rejects.toThrow('test6 Error')
        await expect(ebt.send('test7')).rejects.toThrow('test7 Error')
        await expect(ebt.send('test8')).rejects.toThrow('test8 Error')

        try {
            await ebt.send('test9')
        } catch(e) {
            expect(e.name).toEqual('TypeError')
            expect(e.testProps).toEqual('test props')
        }

    })

}