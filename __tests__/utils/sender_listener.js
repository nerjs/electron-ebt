const path = require('path')
const openWin = require('./open_win')


const script = path.join(__dirname, 'sender_script.js')

module.exports = () => {
    let win;

    beforeAll(async () => {
        win = await openWin(script)
    })

    afterAll(() => {
        win.close()
        win = null;
    })


    test('prevent sending an event', async () => {
        
    })
}