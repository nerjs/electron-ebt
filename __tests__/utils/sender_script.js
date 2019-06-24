const { ipcRenderer, remote: { getCurrentWindow }} =  require('electron')
const sleep = require('nerjs-utils/core/sleep')


const EBT = require('../../lib/ebt')


const ebt = new EBT()

ebt.initialize({
    name: `test:${getCurrentWindow().id}`,
    sender: ipcRenderer, 
    listener: ipcRenderer
})


ebt.on('test1', e => e.setResult({a:1}))


ebt.on('test2', e => e.setResult(e.data))
ebt.on('test3', (e, data) => e.setResult(data))


ebt.on('test4', e => e.setResult({ a: 1, b: 2 }))
ebt.on('test4', e => e.setResult({ b: 3, c: 4 }))


ebt.on('test5', e => e.setResult({ a: 1, b: 2 }))
ebt.on('test5', e => e.setResult(async () => {
    await sleep(50)
    e.setResult({b: 3, c: 4 })
}))
ebt.on('test5', e => e.setResult(async () => {
    await sleep(20)
    e.setResult({ b: 30, c: 40 })
}))

ebt.on('test5', e => e.setResult((async () => {
    await sleep(20)
    e.setResult({ e: 6 })
})()))


ebt.on('test5', e => e.setResult(sleep(60).then(() => e.setResult({d:5}))))


ebt.on('test6', e => e.setResult(new Error('test6 Error')))
ebt.on('test7', e => e.setResult(() => new Error('test7 Error')))
ebt.on('test8', e => e.setResult(() => {
    throw new Error('test8 Error')
}))

ebt.on('test9', e => {
    const err = new TypeError('test9 Error')
    err.testProps = 'test props'
    e.setResult(err)
})
