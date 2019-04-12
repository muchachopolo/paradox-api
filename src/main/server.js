var app = require('express')();
var merge = require('merge');

var logger = require('./api/services/logger-service').getLogger(__filename);
var config = require("./api/services/config-service");

require('./api/filters/filters')(app);

require('./api/controllers/controllers')(app);

app.listen(config.user.port, function () {
    logger.info('Paradox API listening on port ' + config.user.port);

    var userOnlyClone = JSON.parse(JSON.stringify(config.userOnly));

    //config.userOnly.ipModule.url = "********";
    userOnlyClone.ipModule.login && (userOnlyClone.ipModule.login = "********");
    userOnlyClone.ipModule.password && (userOnlyClone.ipModule.password = "********");
    for (let cred of  Object.getOwnPropertyNames(userOnlyClone.api.users)) {
        userOnlyClone.api.users[cred] = '********';
    }

    logger.info('User config : \nmodule.exports = ' + JSON.stringify(userOnlyClone, null, 1));
});
