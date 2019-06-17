const { ipcMain, ipcRenderer } = require('electron')
const isRenderer = require('is-electron-renderer')
const merge = require('merge')
const EventEmitter = require('events')

const checkArgs = require('./utils/check_args')
const parseArgs = require('./utils/parse_args')
const EBTEvent = require('./utils/event_message')

// console.log(EventEmitter)


class EBT extends EventEmitter {
    initialize(data, opt) {
        const { sender, listener, name } = parseArgs(data, {
            name: `message:${process.pid}`, 
            sender: isRenderer ? ipcRenderer : undefined,
            listener: isRenderer ? ipcRenderer : ipcMain
        })
        checkArgs(sender, 'object', ['send'])
        checkArgs(listener, 'object', ['on', 'once', 'removeListener'])
        checkArgs(name, 'string')

        this.ipcSender = sender;
        this.ipcListener = listener;
        this.eventName = name;
        this.senderOptions = merge({
            confirmTimeout: 2000,
            waitConfirmTimeout: 30000
        }, opt)

        this.__cbCount = 0;

        const handler = (e, d) => this.parseEvent(e, d)
        this.ipcListener.on(this.eventName, handler)
        this.once('reinitialize', () => {
            if (!listener) return;
            listener.removeListener(name, handler)
        })
        this.emit('initialize')
    }

    reinitialize() {
        
        this.ipcSender = null;
        this.ipcListener = null;
        this.eventName = null;
        this.emit('reinitialize')
    }

    async parseEvent(e, _data) {
        if (!this.ipcSender) return;

        const { name, data, cb } = merge({}, {
            name: 'null',
            data: {},
            cb: 'null:_'
        }, _data)

        const event = new EBTEvent(false, data)

        this.emit(name, event, data)

        if (event.isPromise()) {
            this.ipcSender.send(`${cb}/wait`)
            await event.getPromises()
        }

        const result = event.getResult()

        if (result.error) {
            const _err = result.error;
            result.error = {
                message: _err.message,
                trace: _err.trace,
                name: _err.name
            }

            Object.keys(_err).forEach(key => {
                result.error[key] = _err[key]
            })
        } 

        this.ipcSender.send(`${cb}/result`, result)
    }

    send(name, data) {
        return new Promise((resolve, reject) => {
            const eventName = this.eventName, 
                sender = this.ipcSender, 
                listener = this.ipcListener,
                cbCount = this.__cbCount++,
                cb = `${name}:${cbCount}:${Math.random()}`,
                ct = this.senderOptions.confirmTimeout,
                wct = this.senderOptions.waitConfirmTimeout;

            let tid = null, actualTime = ct, handlerCb, handlerCbWait, handlerTimeout, err, event;
            
            event = new EBTEvent(true, data)
            this.emit(`pre:${name}`, event, data)

            const res = event.getResult()
            if (res.error || res.prevented) {
                if (res.error) {
                    err = res.error
                } else {
                    err = new Error(`Event ${name} has been prevented`)
                    err.prevented = true
                }
                return reject(err)
            }


            handlerCb = (e, r) => {
                if (!tid) return;
                clearTimeout(tid)
                tid = null;
                listener.removeListener(`${cb}/wait`, handlerCbWait)
                if (!r || typeof r != 'object') return resolve()


                if (r.error) {
                    err = new Error(r.error.message)
                    Object.keys(e.error).forEach(key => {
                        err[key] = r.error[key]
                    })

                    return reject(err)
                }


                event = new EBTEvent(false, r)
                if (r.prevented) {
                    if (typeof r.result != 'object') {
                        r.result = {}
                    }
                    r.result._prevented = true
                    event.preventDefault()
                }
                this.emit(`post:${name}`, event, r)

                if (event.getResult().error) return reject(event.getResult().error)

                resolve(r.result)        
            }
            

            handlerCbWait = () => {
                if (!tid) return;
                clearTimeout(tid);
                tid = setTimeout(handlerTimeout, wct)
                actualTime = wct
            }

            handlerTimeout = () => {
                if (!tid) return;
                tid = null;
                listener.removeListener(`${cb}/wait`, handlerCbWait)
                listener.removeListener(`${cb}/result`, handlerCb)

                reject(new Error(`Callback time expired [${name}] [${actualTime}ms]`))
            }

            tid = setTimeout(handlerTimeout, ct);
            listener.once(`${cb}/result`, handlerCb)
            listener.once(`${cb}/wait`, handlerCbWait)

            sender.send(eventName, {
                name, 
                cb, 
                data
            })
        })
    }
}


module.exports = EBT
