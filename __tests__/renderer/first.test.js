const ir = require('is-electron-renderer')


describe('renderer tests', () => {
    test('is renderer', () => {
        expect(ir).toBe(true);
    })
})