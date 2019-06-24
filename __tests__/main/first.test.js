
const ir = require('is-electron-renderer')


describe('first test', () => {
    test('is not renderer', () => {
        expect(ir).toBe(false);
    })

})