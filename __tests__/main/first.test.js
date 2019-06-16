
const ir = require('is-electron-renderer')
const path = require('path')

const openWin = require('../utils/open_win')
const sleep = require('../utils/sleep')


describe('first test', () => {
    test('is not renderer', () => {
        expect(ir).toBe(false);
    })

    test('open window', async () => {
        const win = await openWin(path.join(__dirname, '..', 'utils', 'tr_script.js'))
    },20000)

})