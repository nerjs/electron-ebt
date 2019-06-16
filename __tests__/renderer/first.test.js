const ir = require('is-electron-renderer')


describe('renderer tests', () => {
    test('is renderer', () => {
        expect(ir).toBe(true);
    })

    test('f', () => {
        expect(1).toBe(1);
        expect(() => {
            throw new Error('as')
        }).toThrow('as')
    })
})