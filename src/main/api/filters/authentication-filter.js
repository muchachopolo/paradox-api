var basicAuth = require('express-basic-auth');
var config = require('../services/config-service');
var logger = require('../services/logger-service').getLogger(__filename);

module.exports = (app) => {
    app.use(basicAuth({
        authorizer: function (username, password) {
            var a = false;
            if (config.user.api.forwardCredentials) {
                logger.debug(`Forwarding credentials to ip150`);
                config.user.ipModule.login = username;
                config.user.ipModule.password = password;
                a = true;
            } else {
                a = (config.user.api.users[username] === password );
                if (a) {
                    logger.debug("User " + username + " : authenticated");
                } else {
                    logger.warn("User " + username + " : access denied !");
                }
            }
            return a;
        },
        challenge: true,
        realm: 'Paradox API',
        unauthorizedResponse: function (req) {
            return req.auth ? 'Credentials rejected' : 'No credentials provided';
        }
    }));
}