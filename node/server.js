var express = require('express');
var execSync = require('child_process').execSync;
 var app = require('express')()
//var auth = require('express-basic-auth');
var basicAuth = require('express-basic-auth');

var userConfig = require("./config");

var config = {
  bindingRequestedTarget : {"regular": "armed", "forced": "armed", "partial": "partial", "immediate": "immediate", "ready": "ready"},
  phantom: "phantomjs --ignore-ssl-errors=true",
  script: "phantom.js",
  readCount: 2,
  writeCount: 5,
  users : userConfig.api.users,
//  ip150: {}
};

app.use(basicAuth({
	// users: config.users,
	authorizer: function (username, password) {
		var a = (config.users[username] === password);
		console.log("User " + username + (a ? " authenticated" : " : access denied !"));
        /*
        if (a) {
          ip150 = {
            user: username,
            password: password
          };
        } else {
          config.ip150 = {};
        }
        */
		return a;
	},
    challenge: true,
    realm: 'Paradox API',
    unauthorizedResponse: function (req) {
	    return req.auth ? 'Credentials rejected' : 'No credentials provided';
	}
}));

app.get('/area/:area/:state', function (req, res) {
	json(res);

    var area = req.params.area;
    var state = req.params.state;
    var r = setAreaState(area, state);
    if (r) {
		res.write(JSON.stringify(r));
	} else {
		res.write(JSON.stringify({error: "Failed"}));
	}

	res.end();
});

app.get('/area/:area', function (req, res) {
    json(res);

    var area = req.params.area;

	res.write(JSON.stringify(getAreaStatus(area)));

	res.end();
});

app.get('/area', function (req, res) {
    json(res);

	res.write(JSON.stringify(getAreasStatus()));

	res.end();
});


app.get('/*', function (req, res) {
    res.contentType("text/plain");

	res.write(getHelp());
	
	res.end();
});

function setAreaState(area, state) {
	var targetedState = config.bindingRequestedTarget[state];
    for (var i = 0; i < config.writeCount; i++) {
		console.log("Try to set state of area " + area + " to " + targetedState + " (method: " + state + "). #"+ (i+1) + "...");
		execSync(config.phantom + " "+ config.script + " set -a " + area + " -s " + state);
        var areaStatus = getAreaStatus(area);
		if (areaStatus.state == targetedState) {
			console.log("State of area " + area + " in now " + targetedState + " (method: " + state + ").");
			return areaStatus;
		}
    }
	var message = "Failed to set state of area " + area + " to " + targetedState + " (method: " + state + ").";
	console.log(message);
	return {error: message};
}

function json(res) {
    res.contentType("application/json");
}

function getAreasStatus() {
  var ret = {};
  for (var i = 0; i < config.readCount; i++) {
    console.log("Try to get areas state. #"+ (i+1) + "...");
    status = JSON.parse(execSync(config.phantom + " " + config.script + " status"));
    if (status && status.areas) {
		ret = status.areas;
        break;
    }
  }
  console.log("getAreasStatus : " + JSON.stringify(ret));
  return ret;
}

function getAreaStatus(area) {
  var areasStatus = getAreasStatus();
  var ret = {"area": area, state: (areasStatus && areasStatus["area_" + area]) ? areasStatus["area_" + area] : null};
  console.log("getAreaStatus(" + area + ") : " + JSON.stringify(ret));
  return ret;
}

function getHelp() {
	return "[GET] - /area\n"
		+ "  list all areas state\n"
		+ "\n"
		+ "[GET] - /area/:area\n"
		+ "  get area state\n"
		+ "\n"
		+ "[GET] - /area/:area/:state\n"
		+ "  set area state\n"
		+ "\n";
}

app.listen(3000, function () {
  console.log('Paradox API listening on port 3000');
});

