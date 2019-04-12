const fs = require('fs');
const path = require('path');
const merge = require('merge');
const os = require('os');
const user = require("../../data/config");

var app = {
};

var userDef = {
    port: 3000,
    ipModule: {
        url: "https://ip150:443", // The url of the ip150 module (like in your browser)
        login: "1234",
        password: "secret"
    },
    api: {
        attempt: {
            read: 2,
            write: 3,
            check: 1
        },
        forwardCredentials: false,
        users: {
            //"paradox": "api" // login: password pair for using the API
        }
    }
};
module.exports = {
    app: app,
    userDef: userDef,
    userOnly: merge.recursive({}, userDef, user),
    user: merge.recursive({}, app, userDef, user)
};