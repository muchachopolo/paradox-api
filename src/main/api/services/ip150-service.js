var http = require("http");
var https = require("https");

var config = require('./config-service');
var ip150Js = require('../services/ip150-js-service');
var logger = require('../services/logger-service').getLogger(__filename);

const h = config.user.ipModule.url;
const connector = h.startsWith("https") ? https : http;
var credentials;

var authenticate = () => httpCall(h + "/login_page.html")
    .then((html)=>new Promise((resolve, reject) => {
        var ses = html.split('loginaff("')[1].split('",')[0];
        const u = config.user.ipModule.login;
        const p = config.user.ipModule.password;
        credentials = ip150Js.loginencrypt(u, p, ses);
        resolve(credentials);
    }))
    .then((credentials) => httpCall(`${h}/default.html?u=${credentials.u}&p=${credentials.p}`))
    //.then(() => wait(1000))
    .then(()=>new Promise(resolve => resolve()))
    ;

var logout = () => httpCall(`${h}/logout.html`).then(()=>new Promise(resolve => resolve()));

var liveStatus = () => {
    var url = `${h}/statuslive.html`;
    return httpCall(url).then((data) => new Promise(resolve => {
        var areas_machine = JSON.parse('[' + data.split('tbl_useraccess = new Array(')[1].split(')')[0] + ']');
        var zones_machine = JSON.parse('[' + data.split('tbl_statuszone = new Array(')[1].split(')')[0] + ']');
        var alarmes_machine = JSON.parse('[' + data.split('tbl_alarmes = new Array(')[1].split(')')[0] + ']');
        var troubles_machine = JSON.parse('[' + data.split('tbl_troubles = new Array(')[1].split(')')[0] + ']');

        var areas = {};
        var zones = zones_machine;
        var alarmes = alarmes_machine;
        var troubles = troubles_machine;

        for (let idx in areas_machine) {
            areas[getEnumBy("code", AREA, "0" + idx).name] = getEnumBy("code", STATUS, areas_machine[idx]).name;
        }

        resolve({
            areas: areas,
            zones: zones,
            alarmes: alarmes,
            troubles: troubles
        });
    }));
};

var events = () => httpCall(`${h}/event.html`)
    .then((data) => new Promise(resolve => {
        var events = JSON.parse(data.split('events =')[1].split(']')[0] + ']');
        resolve(events);
    }));

//var setAreaArmingMode = (area, armingMode) => httpCall(`${h}/statuslive.html?area=${area.code}&value=${armingMode.code}`)
var setAreaArmingMode = (area, armingMode) => {
    return wait(4000)
        .then(() => httpCall(`${h}/statuslive.html?area=${area.code}&value=${armingMode.code}`))
        //.then(() => wait(3000))
        .then(() => new Promise(resolve => resolve()))
};

var keepAlive = () => httpCall(`${h}/keep_alive.html?msgid=1&28121804573391196`)
    .then(() => new Promise(resolve => resolve()));


// data, s = connect_ip150readData(s, "GET /statuslive.html?area=0" + str(int(Control_Partition)-1) + "&value=" + Control_NewState + "
// HTTP/1.1\r\n
// Host: " + IP150_IP + ':' + str(IP150_Port) + "\r\n
// Connection: keep-alive\r\nCache-Control: max-age=0\r\n
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\r\n
// Upgrade-Insecure-Requests: 1\r\n
// User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36\r\n
// Accept-Encoding: gzip, deflate, sdch\r\n
// Accept-Language: en,af;q=0.8,en-GB;q=0.6\r\n\r\n")
var httpCall = (url) => new Promise((resolve, reject) => {
    logger.debug(url);
    connector.get(url, {rejectUnauthorized: false}, (res) => {
        var output = '';
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            logger.trace(output);
            resolve(output);
        });
    }).on('error', (e) => {
        reject(e);
    })
});

var wait = (delay, resolveValue) => new Promise((resolve)=> setTimeout(() => resolve(resolveValue), delay));

const AREA = {
    A1: {name: '1', code: "00"},
    A2: {name: '2', code: "01"},
    A3: {name: '3', code: "02"},
    A4: {name: '4', code: "03"},
    A5: {name: '5', code: "04"},
    A6: {name: '6', code: "05"},
    A7: {name: '7', code: "06"},
    A8: {name: '8', code: "07"}
};

const STATUS = {
    DISABLED: {name: 'disabled', code: "0"},
    ARMED: {name: 'armed', code: "2"},
    PARTIAL: {name: 'partial', code: "5"},
    IMMEDIATE: {name: 'immediate', code: "10"},
    READY: {name: 'ready', code: "8"},
    LE_STATUS_9: {name: 'le_status_9', code: "9"}
};

var ARMING_MODE = {
    "REGULAR": {name: "regular", code: "r"},
    "FORCED": {name: "forced", code: "f"},
    "PARTIAL": {name: "partial", code: "p"},
    "IMMEDIATE": {name: "immediate", code: "i"},
    "READY": {name: "ready", code: "d"}
};

var getEnumBy = (_key, _enums, _value) => {
    for (let p of Object.getOwnPropertyNames(_enums)) {
        var e = _enums[p];
        if (e[_key] == _value) {
            return e;
        }
    }
};

module.exports = {
    authenticate: authenticate,
    logout: logout,
    liveStatus: liveStatus,
    events: events,
    setAreaArmingMode: setAreaArmingMode,
    keepAlive: keepAlive,
    AREA: AREA,
    STATUS: STATUS,
    ARMING_MODE: ARMING_MODE
};
