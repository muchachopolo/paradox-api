var express = require('express');
var execSync = require('child_process').execSync;
var app = require('express')()
var basicAuth = require('express-basic-auth');

var userConfig = require("./config");

var config = {
    bindingRequestedTarget: {"regular": "armed", "forced": "armed", "partial": "partial", "immediate": "immediate", "ready": "ready"},
    phantom: "phantomjs --ignore-ssl-errors=true",
    script: "phantom.js",
    readCount: 2,
    checkCount: 0,
    writeCount: 3,
    users: userConfig.api.users,
    forwardCredentials: userConfig.api.forwardCredentials || false
};

app.use(basicAuth({
    // users: config.users,
    authorizer: function (username, password) {
       log("--------------------------------------------------------------------------------");
        var a = false;
        if (config.forwardCredentials) {
            log("Forwarding credentials to ip150");
            config.ip150 = {user: username, pass: password};
            // config.script += " -u '" + username + "' -p '" + password + "'";
            a = true;
        } else {
            a = (config.users[username] === password);
            log("User " + username + (a ? " authenticated" : " : access denied !"));
        }
        return a;
    },
    challenge: true,
    realm: 'Paradox API',
    unauthorizedResponse: function (req) {
        return req.auth ? 'Credentials rejected' : 'No credentials provided';
    }
}));

app.get('/area', function (req, res) {
    res.contentType("application/json");
    res.write(JSON.stringify(getAreasState()));
    res.end();
});

app.get('/area/:area', function (req, res) {
    res.contentType("application/json");
    res.write(JSON.stringify(getAreaState(req.params.area, config.readCount)));
    res.end();
});

app.get('/area/:area/:state', function (req, res) {
    res.contentType("application/json");
    res.write(JSON.stringify(setAreaState(req.params.area, req.params.state)));
    res.end();
});

app.get('/*', function (req, res) {
    res.contentType("text/plain");
    res.write(getHelp());
    res.end();
});

function setAreaState(area, state) {
    var targetedState = config.bindingRequestedTarget[state];
    var ret;
    var begin = new Date();
    if (targetedState) {
        for (var i = 0; i < config.writeCount; i++) {
            log("Try to set state of area " + area + " to " + targetedState + " (method: " + state + "). #" + (i + 1) + "/" + config.writeCount + "...");
            execSync(config.phantom + " " + config.script + " set " + (config.forwardCredentials ? " -u '" + config.ip150.user  + "' -p '" + config.ip150.pass + "'" : "") + " -a " + area + " -s " + state);
			log("Set state #" + (i + 1) + " duration : " + (new Date() - begin) / 1000 + "s");
            if (config.checkCount) {
                var areaStatus = getAreaState(area, config.checkCount);
                if (areaStatus.state == targetedState) {
                    ret = areaStatus;
                    break;
                } else {
                    log("Failed (total : " + ((new Date() - begin) / 1000) + "s)");
                    ret = {error: "New state is not " + targetedState , id : area, state: areaStatus };
                }
            } else {
                ret = {info: "New state verification disabled", id : area, state: targetedState };
                break;
            }
        }
    } else {
        ret = {error: "Unknow state " + state};
    }
    var ret = ret || {error: "Failed to set state of area " + area + " to " + targetedState + " (method: " + state + ")."};
    log(JSON.stringify(ret));
    log("Set state duration : " + ((new Date() - begin) / 1000) + "s");
    return ret;
}

function getAreasState(attempts) {
    attempts = attempts || 1;
    var begin = new Date();
    var ret = {};
    for (var i = 0; i < attempts; i++) {
        log("Try to get areas state. #" + (i + 1) + "/" + attempts + "...");
        cmd = config.phantom + " " + config.script + " status" + (config.forwardCredentials ? " -u '" + config.ip150.user  + "' -p '" + config.ip150.pass + "'" : "");
        status = JSON.parse(execSync(cmd));
        if (status && status.areas) {
            ret = status.areas;
            break;
        }
    }
    log("getAreasState : " + JSON.stringify(ret));
    log("getAreasState duration : " + ((new Date() - begin) / 1000) + "s");
    return ret;
}

function getAreaState(area, attempts = null) {
    attempts = attempts || 1;
    var ret;
    var areasStatus = getAreasState(attempts);
    for (var index = 0; areasStatus.length > index; index++) {
        if (area == areasStatus[index].id) {
            ret = areasStatus[index];
        }
    }
    ret = ret || {error: "Couldn't find area " + area};
    log("getAreaState(" + area + ") : " + JSON.stringify(ret));
    return ret;
}

function getHelp() {
    return "[GET] - /area\n"
            + "  list all areas state\n\n"
            + "[GET] - /area/:area\n"
            + "  get area state\n\n"
            + "[GET] - /area/:area/:state\n"
            + "  set area state ("+ Object.keys(config.bindingRequestedTarget).join(" | ") +")\n\n"
}

function log(message) {
    console.log(new Date() + " - " + message);
}

app.listen(3000, function () {
    console.log('Paradox API listening on port 3000' + '\n\n' + getHelp());
});

