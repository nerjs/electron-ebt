const EBTEvent = require('../../lib/utils/event_message')
const sleep = require('./sleep')

module.exports = () => {

    test('Start data', () => {
        const event = new EBTEvent()

        expect(event.resultValues).toBeInstanceOf(Array)
        expect(event.resultPromises).toBeInstanceOf(Array)
        expect(event.resultError).toEqual(null)
        expect(event.resultPromises.length).toEqual(0)
        expect(event.resultValues.length).toEqual(0)

        expect(event.isPromise()).toEqual(false)
        expect(event.isError()).toEqual(false)

        expect(event.getResult()).toEqual({
            result: {},
            error: null,
            prevented: false 
        })

        expect(event.initiator).toEqual(false)
    })

    test('Insert data', () => {
        const event = new EBTEvent(true, 'test data')
        expect(event.data).toEqual('test data')
        expect(event.initiator).toEqual(true)
    })

    test('preventDefault', () => {
        const event = new EBTEvent()
        expect(event.defaultPrevented).toEqual(false)
        event.preventDefault()
        expect(event.defaultPrevented).toEqual(true)
    })


    test('result events', () => {
        const event = new EBTEvent()
        const err = new Error('test error')

        event.setResult({ a: 1, b: 2 })
        event.setResult('test')
        expect(event.resultValues.length).toEqual(1)

        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 2
            },
            error: null,
            prevented: false 
        })


        event.setResult({ b: 3, c: 4 })
        expect(event.resultValues.length).toEqual(2)

        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 3, 
                c: 4
            },
            error: null,
            prevented: false 
        })

        event.setResult(err)
        expect(event.resultError).toEqual(err)
        expect(event.isError()).toEqual(true)
        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 3, 
                c: 4
            },
            error: err,
            prevented: false 
        })


        event.setResult({ d: 5})
        expect(event.resultValues.length).toEqual(2)

        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 3, 
                c: 4
            },
            error: err,
            prevented: false 
        })

    }) 

    test('result promises', async () => {
        const event = new EBTEvent()
        const err = new Error('test error')

        event.setResult(sleep(100))

        expect(event.resultPromises.length).toEqual(1)

        expect(event.isPromise()).toEqual(true)

        await event.getPromises()


        expect(event.resultPromises.length).toEqual(0)

        expect(event.isPromise()).toEqual(false)

        event.setResult(Promise.resolve())

        expect(event.resultPromises.length).toEqual(1)

        expect(event.isPromise()).toEqual(true)

        await event.getPromises()


        expect(event.resultPromises.length).toEqual(0)

        expect(event.isPromise()).toEqual(false)


        event.setResult(Promise.resolve({a: 1, b: 2}))
        event.setResult(Promise.resolve({b: 3, c: 4}))

        expect(event.resultPromises.length).toEqual(2)
        await event.getPromises()

        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 3, 
                c: 4
            },
            error: null,
            prevented: false 
        })


        event.setResult(new Promise((r, reject) => {
            setTimeout(() => reject(err), 20)
        }))
        event.setResult(new Promise(resolve => {
            setTimeout(() => resolve({ d: 5 }), 30)
        }))

        expect(event.resultPromises.length).toEqual(2)


        await expect(event.getPromises()).rejects.toThrow('test error')

        expect(event.getResult()).toEqual({
            result: {
                a: 1,
                b: 3, 
                c: 4
            },
            error: err,
            prevented: false 
        })

    })
}