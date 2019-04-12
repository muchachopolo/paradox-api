var logger = require('./logger-service').getLogger(__filename);
var config = require('./config-service');
var ip150Service = require('../services/ip150-service');

var getAreasState = () => ip150Service.authenticate()
    .then(ip150Service.liveStatus)
    .then(status => new Promise(resolve => resolve(status.areas)))
    .finally(ip150Service.logout);

var getAreaState = (area) =>ip150Service.authenticate()
    .then(ip150Service.liveStatus)
    .then(status => new Promise((resolve) => {
        var o = {};
        o[area] = (status.areas[area] || ip150Service.STATUS.DISABLED.name);
        resolve(o)
    }))
    .finally(ip150Service.logout);


var setAreaArmingMode = (area, armingMode) => ip150Service.authenticate()
    .then(()=> ip150Service.setAreaArmingMode(ip150Service.AREA["A" + area], ip150Service.ARMING_MODE[armingMode.toUpperCase()]))
    .then(() => {
        return {}
    })
    .finally(ip150Service.logout);


module.exports = {
    getAreasState: getAreasState,
    getAreaState: getAreaState,
    setAreaArmingMode: setAreaArmingMode
};

