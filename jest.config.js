const isRenderer = require('is-electron-renderer')


console.log('isRenderer', isRenderer)

module.exports = {
    displayName: `${isRenderer ? 'renderer' : 'main'} process`,
    runner: '@jest-runner/electron/main',
    testEnvironment: 'node',
}