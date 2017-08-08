var page = new WebPage();
var index = 0;
var loadInProgress = false;
var playing = false;

var system = require('system');
var config = require("./config");
var args = system.args;

config.verbose = false;
config.scenario = null;
config.bindingOutAreaStates =  { "0": "disabled",  "2": "armed",              "5": "partial",       "10": "immediate", "8": "ready" };
config.bindingOutZoneStatess = { "0": "disabled"};
config.bindingInStates =       {                   "regular": "r", "forced" : "f", "partial": "s",  "immediate": "i",  "ready": "d" };
config.bindingInAreas =        { "1": "00",  "2": "01"};

for (var i = 1; i < args.length; i++) {
  var prevArg = (i > 1) ? args[i-1] : null;
  var arg = args[i];
  if (null == prevArg) {
    config.scenario = arg;
  }
  if ("-v" == arg) {
    config.verbose = true;
  }
  if ("-a" == prevArg || "--area" == prevArg) {
    config.area = config.bindingInAreas[arg];
  }
  if ("-s" == prevArg || "--state" == prevArg) {
    config.state = config.bindingInStates[arg];
  }
}

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  if (config.verbose) {
    console.error(msgStack.join('\n'));
  }
};

page.onConsoleMessage = function(msg) {
  if (config.verbose) {
    console.log(msg);
  }
};

page.onLoadStarted = function() {
  loadInProgress = true;
  if (config.verbose) {
    console.log(" => load started");
  }
};

page.onLoadFinished = function() {
  loadInProgress = false;
  if (config.verbose) {
    console.log(" => load finished");
  }
};

var steps = {
  openLogin: {
    name: "Open login page",
    action: function(config) {
      page.open(config.url + "/login_page.html");
    }
  },
  openLogout: {
    name: "Logout",
    action: function(config) {
      page.open(config.url + "/logout.html");
    }
  },
  login: {
    name: "Login",
    action: function(config) {
      page.evaluate(function(config) {
        var r = {};

        pass = hex_md5(top.keeplowbyte(config.password)) + document.lf.ses.value;
        r.u = rc4(pass, config.login);
        r.p = hex_md5(pass);

        document.getElementById("user").value=config.login;
        document.getElementById("pass").value=config.password;
        document.getElementsByName("loginsub")[0].click();
        return r;
      }, config)
    }
  },
  openWaitLive: {
    name: "Wait live",
    action: function (config) {
      page.open(config.url + "/wait.html");
    }
  },
  openStatus: {
    name: "Status live",
    action: function (config) {
      page.open(config.url + "/statuslive.html");
    }
  },
  openSetStatus: {
    name: "Set status",
    action: function (config) {
      page.open(config.url + "/statuslive.html?area=" + config.area + "&value=" + config.state);
    }
  },
  frames: {
    name: "Frames",
    action: function (config) {
      page.open(config.url + "/default.html?u=" + config.u + "&p=" + config.p);
    }
  },
  html: {
    name: "Print HTML",
    action: function(config) {
      page.evaluate(function(config) {
        console.log(document.documentElement.outerHTML);
      }, config);
    }, 
  },
  grepStatus: {
    name: "Status",
    action: function(config) {
      return page.evaluate(function(config) {
        var ret = {
          areas: {},
          zones: {}
        };

        for (var i = 0; i< tbl_useraccess.length; ++i) {
          var friendlyNameId = tbl_useraccess[i];
          var friendlyName = config.bindingOutAreaStates[friendlyNameId];
          if (undefined != friendlyName) {
            ret.areas["area_"+(i+1)] = friendlyName;
          } else {
            ret.areas["area_"+(i+1)] = friendlyNameId;
          }
        }
        /*
        for (var i = 0; i< tbl_statuszone.length; ++i) {
          var friendlyNameId = tbl_statuszone[i];
          var friendlyName = config.bindingOutZoneStatess[friendlyNameId];
          if (undefined != friendlyName) {
            ret.zones["zone_"+(i+1)] = friendlyName;
          } else {
            ret.zones["zone_"+(i+1)] = friendlyNameId;
          }
        }
        */
       
		return ret;
      }, config);
    }, 
  }

};

if ("status" == config.scenario) {
  play([steps.openLogin, steps.login, steps.openWaitLive, steps.openStatus, steps.html, steps.grepStatus, steps.openLogout]);
} else if ("test" == config.scenario) {
  play([steps.openLogin, steps.login, steps.frames, steps.html, steps.openLogout]);
} else if ("set" == config.scenario) {
  if (undefined == config.area) {
    console.log("Specify an area (-a | --area) (" + Object.keys(config.bindingInAreas).join(" | ") + ")");
    phantom.exit();
  }
  if (undefined == config.state) {
    console.log("Specify a state (-s | --state) (" + Object.keys(config.bindingInStates).join(" | ") + ")");
    phantom.exit();
  }
  play([steps.openLogin, steps.login, steps.openWaitLive, steps.openStatus, steps.openSetStatus, steps.openLogout]);
} else {
  console.log("Specify an action (status | set)");
  phantom.exit();
}

function play(scenario) {
  toPrint = null;
  interval = setInterval(function() {
    if (!loadInProgress) {
      if (typeof scenario[index] != "undefined") {
        if (config.verbose) {
          console.log("Step : " + scenario[index].name);
        }
        var r = scenario[index].action(config);
        if (config.verbose) {
          console.log("Step " + scenario[index].name + " returns: ");
          console.log(r);
        }
        toPrint = toPrint || r;
        index++;
      } else {
        console.log(JSON.stringify(toPrint || {error: "An error occured"}));
        phantom.exit();
      }
    }
  }, 50);
}

