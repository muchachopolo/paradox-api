var warn = (name, msg) => {
    console.log('[INFO]  - ' + new Date().toLocaleString() + ' - ' + name + ' - ' + msg);
};

var info = (name, msg) => {
    console.log('[INFO]  - ' + new Date().toLocaleString() + ' - ' + name + ' - ' + msg);
};

var debug = (name, msg) => {
    console.log('[DEBUG] - ' + new Date().toLocaleString() + ' - ' + name + ' - ' + msg);
};

var trace = (name, msg) => {
    //console.log('[TRACE] - ' + new Date().toLocaleString() + ' - ' + name + ' - ' + msg);
};

module.exports = {
    getLogger: (name) => {
        name = name.replace(process.cwd() + '/dist/', "");

        return {
            warn: (msg) => warn(name, msg),
            info: (msg) => info(name, msg),
            debug: (msg) => debug(name, msg),
            trace: (msg) => trace(name, msg)
        }
    }
};
