var logger = require('../services/logger-service').getLogger(__filename);

module.exports = function (app) {

    var help = [];

    app.registerController = (method, path, controller, helpMsg) => {
        app[method](path, controller);
        help.push({path: path, method: method, help: helpMsg});
    };

    require('./area-controller')(app);

    for (let h of help) {
        logger.info(`[${h.method.toUpperCase().padStart(5, ' ')}] - ${h.path}`);
        if (h.help) {
            logger.info(`  ${h.help.split('\n').join('\n  ')}`);
        }
    }

    app.registerController('get', "/api/*", (req, res) => {
        res.contentType("text/plain");
        for (let h of help) {
            res.write(`[${h.method.toUpperCase()}] - ${h.path}\n`);
            res.write(`  ${h.help ? h.help.split('\n').join('\n  ') : '\n'}`);
            res.write(`\n`);
        }
        res.end();
    });

}