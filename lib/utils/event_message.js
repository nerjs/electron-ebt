const merge = require('merge')
const sleep = require('nerjs-utils/core/sleep') 
const CustomEvent = require('nerjs-utils/electron/custom_event')


class EBTEventMessage extends CustomEvent {
    constructor(initiator, data) {
        super('EBTEventMessage', {
            cancelable: true
        })
        

        try {
            Object.defineProperty(this, Symbol.toStringTag, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: 'EBTEvent'
            });
        } catch(e) {}

        this.data = data
        this.initiator = !!initiator
        this.resultValues = []
        this.resultError = null
        this.resultPromises = []
    }

    isPromise() {
        return this.resultPromises.length > 0
    }

    isError() {
        return !!this.resultError
    }

    setResult(res) {
        if (res instanceof Promise) {
            

            res.__isSet = true
            res.then(r => {
                this.setResult(r)
                return r
            }).catch(e => this.setResult(e)).finally(() => {
                this.resultPromises = this.resultPromises.filter(rp => rp !== res)    
                return true            
            })
            this.resultPromises.push(res)
        } else if (this.resultError) {
            return;
        } else if (res instanceof Error) {
            this.resultError = res;
        } else if (typeof res == 'object') {
            this.resultValues.push(res)
        } else if (typeof res == 'function') {
            try {
                const _res = res() 
                if (typeof _res != 'function') {
                    this.setResult(_res)
                }
            } catch(e) {
                this.setResult(e)
            }
        }
    }

    getResult() {
        return {
            result: merge.apply(this, this.resultValues.filter(v => typeof v === 'object')),
            error: this.resultError instanceof Error ? this.resultError : null,
            prevented: this.defaultPrevented
        }
    }

    async getPromises(count=0) {
        if (!this.isPromise()) return this.getResult()
        await Promise.all(this.resultPromises.filter(p => p instanceof Promise && p.__isSet))
        await sleep(50)
        if (this.isPromise() && count < 10) return this.getPromises(++count);
        return this.getResult();
    }
}


module.exports = EBTEventMessage
