# electron-ebt

A module that provides interaction between two IPC clients (ipcMain, browserContents, or ipcRendering) with the ability to confirm sending a message or prevent sending.
Facilitates communication between windows.

## install 
```
npm i --save electron-ebt
``` 

***

## usage 


### initialization 


```js
const EBT = require('electron-ebt')
```

**initializing process/window (main/renderer process):**

```js
// main process
const { BrowserWindow, ipcMain } = require('electron')

// renderer process
const { remote: { BrowserWindow, ipcMain } } = require('electron')

const EBT = require('electron-ebt')



const win = new BrowserWindow(...) 

const ebt = new EBT()

ebt.initialize({
    name: 'test_win', 
    sender: win.webContents,
    listener: ipcMain // default value for main process
}, params /* Object, optional */)

```



**target window (renderer process):**
```js
const { ipcRenderer } = require('electron')

const EBT = require('electron-ebt')



const ebt = new EBT()

ebt.initialize({
    name: 'test_win', 
    sender: ipcRenderer, // default value for renderer process
    listener: ipcRenderer // default value for renderer process
}, params /* Object, optional */)

```
> for target window, it is not necessary to specify a `sender` and `listener`.

Alternative initialization:
```js 
ebt.initialize('test_win')
```
**init data (first argument):**
|name|type|desription|default|
|:--|:--:|:--|:--:|
|name|String|It is with this name that all messages will be sent.|*null*|
|sender|Object|The send method of this object will be used to send messages.| **ipcRenderer** for renderer process. **null** fo main process|
|listener|Object|Receiving messages will be through this object| **ipcRenderer** for renderer process. **ipcMain** for renderer process|

<a name="init_params"></a>
**Params:**
|name|type|desription|default|
|:--|:--:|:--|:--:|
|confirmTimeout|Number|Waiting for a response if failure is not a Promise. At the expiration of the specified time, an exception will be thrown|2000| 
|waitConfirmTimeout|Number|Waiting for a response if failure is a Promise. At the expiration of the specified time, an exception will be thrown.|30000|

Reset handlers:
```js
ebt.reinitialize()
```

*** 

### sending message 
> method **EBT.prototype.send** returns **Promise**

The first argument will go everywhere callbacks object events.


The class of the [event object](#EBTEvent) can be obtained:
```js
const { EBTEvent } = require('electron-ebt')
```

**sending:**
```js 
try {
    const res = await ebt.send('test' /*event name*/, {} /*data*/)

    console.log(res) // answer
} catch(e) {
    console.error(e) // answer error
}
```

### prevent sending a message 

> Before sending a message, an event with prefix `pre:` will be triggered.
> 
```js 
ebt.on('pre:test', event => {
    console.log(event.initiator) // true
    console.log(event.defaultPrevented) // false
    if (event.data.a === 1) event.preventDefault()
    console.log(event.defaultPrevented) // true
})

try {
    await ebt.send('test', { a: 1 })
} catch(error) {
    console.log(error) // Error: Event test has been prevented
    console.log(error.prevented) // true
}

```

### Message processing upon receipt:

Upon receipt of the message, it is possible to return the result along with confirmation 

***target:*** 
```js
ebt.on('test', (event, data) => {
    // event.data === data 
    console.log(data) // { a: 1 }
    event.setResult({ b: 2 })
})
```

***sender***
```js
const res = await ebt.send('test', { a: 1 })
console.log(res) // { b: 2 }
```

### EBTEvent() 

All handlers receive the first argument an instance of this object.

####methods and properties

|name|type|desription|params|returns|
|:--:|:--:|:--|:--:|:--:|
| data | Object | The data transmitted by the sender | | {} | 
| initiator | Boolean | Returns a true if the message is initiated (send method is called) by the current object | | false | 
| defaultPrevented | Boolean | Whether method preventDefault was previously called or not | | false | 
| isPromise | Function | Do I have to wait for completion of the promises before getting the result | | false | 
| isError | Function | Has an Error object been added | | false | 
| getResult | Function | Result Already Installed | | [Object](#EBTEventprototypegetResult) | 
| setResult | Function | Setting result | [Object](#EBTEventprototypesetResult) | | 
| getPromises | Function | Returns a Promise that will end when the previously installed Promises are completed. | | Promise |

#### EBTEvent.prototype.getResult() 
```js
{
    result: {}, 
    error: null, // or Error('')
    prevented // === event.defaultPrevented 
}
```


#### EBTEvent.prototype.setResult() 
Takes one argument that can match the types:
> Object, Error, Promise, Function 

***Object:*** 
Each established result supplements that which has been established earlier. 

```js 
// TARGET 
ebt.on('test', event => event.setResult({ a: 1 }))
ebt.on('test', event => event.setResult({ b: 2 }))
/*...*/

// SENDER

console.log(await ebt.send('test')) // { a: 1, b: 2 } 
```

***Error:*** 
The error is set once.
After installing the error, only promise can be transmitted. Object and Error are no longer accepted.


```js 
// TARGET 
ebt.on('test', event => event.setResult(new Error('test event error №1')))
ebt.on('test', event => event.setResult({ a: 1 }))
ebt.on('test', event => event.setResult(new Error('test event error №2')))
/*...*/

// SENDER

try {
    await ebt.send('test')
} catch(error) {
    console.error(error) // Error: test event error №1
}
```

***Promise:***
Target will wait for all promises to be completed before sending confirmation. 



```js 
// TARGET 
ebt.on('test', event => event.setResult(new Promise(resolve => {
    setTimeout(resolve, 1500)
})))
/*...*/

// SENDER
console.time('t')
await ebt.send('test')
console.timeEnd('t') // ~1500ms
```

Setting the result is possible both by returning the data and by calling `event.setResult()`


```js 
// TARGET 
ebt.on('test', event => event.setResult(new Promise(resolve => {
    resolve({ a: 1 })
})))
ebt.on('test', event => event.setResult(new Promise(resolve => {
    event.setResult({ b: 2 })
    resolve()
})))
/*...*/

// SENDER
console.log(await ebt.send('test')) // { a: 1, b: 2 }
``` 



```js 
// TARGET 
ebt.on('test', event => event.setResult(new Promise((resolve, reject) => {
    reject(new Error('test error'))
})))
/*...*/

// SENDER

try {
    await ebt.send('test')
} catch(error) {
    console.error(error) // Error: test error
}
```


```js 
// TARGET 
ebt.on('test', event => event.setResult(new Promise(resolve => {
    event.setResult(new Error('test error'))
    resolve()
})))
/*...*/

// SENDER

try {
    await ebt.send('test')
} catch(error) {
    console.error(error) // Error: test error
}
```

> If the wait exceeds the one set in [params.waitConfirmTimeout](#init_params) during initialization, sending the message will fail.


```js 
// TARGET 
ebt.on('test', event => event.setResult(new Promise(resolve => {
    setTimeout(resolve, 40000)
})))
/*...*/

// SENDER

ebt.initialize({/*...*/}, {
    waitConfirmTimeout: 30000
})

try {
    await ebt.send('test')
} catch(error) {
    console.error(error) // Error: Callback time expired [test] [30000ms]
}
```


***Function:***
The result of the event will get the result of the function. 

```js
// set result
ebt.on('test', event => event.setResult(() => {
    return { a: 1 }
}))

// set error
ebt.on('test', event => event.setResult(() => {
    return new Error('test error')
}))

ebt.on('test', event => event.setResult(() => {
    throw new Error('test error')
}))

// set promise 

ebt.on('test', event => event.setResult(() => {
    return new Promise(/* ... */)
}))

ebt.on('test', event => event.setResult( async () => {
    await sleep(1000)
}))
```
