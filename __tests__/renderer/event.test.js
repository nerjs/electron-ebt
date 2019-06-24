const ce = require('../utils/custom_event')
const EBTCustomEvent = require('nerjs-utils/electron/custom_event')

describe('Custom events', () => {

    test('Event extends object', () => {
        expect(EBTCustomEvent).toEqual(window.CustomEvent)
    })

    ce()
});
