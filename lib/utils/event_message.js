const merge = require('merge')

const CustomEvent = require('./custom_event')

class EBTEventMesaage extends CustomEvent {
    constructor(data) {
        super(type, {
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
            this.resultPromises.push(res.then(r => {
                this.resultPromises = this.resultPromises.filter(rp => rp !== res)
                return r;
            }))
        } else if (this.resultError) {
            return;
        } else if (res instanceof Error) {
            this.resultError = res;
        } else if (typeof res == 'object') {
            this.resultValues.push(res)
        }
    }

    getResult() {
        return {
            result: merge.apply(this, this.resultValues.filter(v => typeof v === 'object')),
            error: this.resultError instanceof Error ? this.resultError : null,
            prevented: this.defaultPrevented
        }
    }

    async getPromises() {
        if (!this.isPromise()) return this.getResult()
        await Promise.all(this.resultPromises.filter(p => p instanceof Promise && p.__isSet))

        if (this.isPromise()) return this.getPromises();
        return this.getResult();
    }
}


module.exports = EBTEventMesaage
