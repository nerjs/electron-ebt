const merge = require('merge')

module.exports = (_data, temp={}) => {
    const data = typeof _data == 'string' ? { name: _data } : merge({}, _data)
    return merge(temp, data)
}

