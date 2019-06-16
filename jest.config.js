
module.exports = {
    projects: [
        {
            displayName: 'Main process',
            runner: '@jest-runner/electron/main',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/main/*.(spec|test).js']
        },
        {
            displayName: 'Renderer process',
            runner: '@jest-runner/electron',
            testEnvironment: '@jest-runner/electron/environment',
            testMatch: ['**/__tests__/renderer/*.(spec|test).js']
        }
      ]
}
