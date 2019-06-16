

module.exports = (data, type, args=[]) => {
    if (!data) throw new Error(`data[${data}] has invalid type`)
    if (typeof data != type) throw new Error(`data[${data}] does not match the type[${type}]`)
    if (type == 'object' && args && Array.isArray(args)) {
        args.forEach(key => {
            if (data[key] === undefined) throw new Error(`data[${data}], missing property[${key}]`)
        })
    }
}