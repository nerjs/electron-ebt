const ce = require('../utils/custom_event')
const EBTCustomEvent = require('../../lib/utils/custom_event')

describe('Custom events', () => {

    test('Event extends object', () => {
        expect(EBTCustomEvent).toEqual(window.CustomEvent)
    })

    ce()
});
