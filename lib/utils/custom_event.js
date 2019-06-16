const isRenderer = require('is-electron-renderer')

if (isRenderer && window) {
    module.exports = window.CustomEvent
} else {
    class CustomEvent {
        constructor(type) {
            this.type = type;
            this.defaultPrevented = false
        }

        preventDefault() {
            this.defaultPrevented = true;
        }
    }

    module.exports = CustomEvent
}