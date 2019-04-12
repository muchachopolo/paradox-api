var path = require('path');
var areaService = require('../services/area-service');
var config = require('../services/config-service');
var logger = require('../services/logger-service').getLogger(__filename);

var getAreasState = function (req, res) {
    areaService.getAreasState().then(data => {
        res.contentType("application/json");
        res.write(JSON.stringify(data));
        res.end();
    })
};


var getAreaState = function (req, res) {
    var area = req.params.area;
    areaService.getAreaState(area).then(data => {
        res.contentType("application/json");
        res.write(JSON.stringify(data));
        res.end();
    })
};

var setAreaArmingMode = function (req, res) {
    var area = req.params.area;
    var armingMode = req.params.armingMode;
    areaService.setAreaArmingMode(area, armingMode).then(data => {
        res.contentType("application/json");
        res.write(JSON.stringify(data));
        res.end();
    })
};

module.exports = (app) => {


    app.registerController('get', '/api/areas', getAreasState, "list all areas state");
    app.registerController('get', '/api/areas/:area', getAreaState, "get area state");
    app.registerController('post', '/api/areas/:area/:armingMode', setAreaArmingMode, "set area arming mode");

    //deprecated api
    app.registerController('get', '/api/areas/:area/:armingMode', setAreaArmingMode, "DEPRECATED - use post:/api/areas/:area/:armingMode");
    app.registerController('get', '/areas', getAreasState, "DEPRECATED - use get:/api/areas");
    app.registerController('get', '/area/:area', getAreaState, "DEPRECATED - use get:/api/areas/:area");
    app.registerController('post', '/area/:area/:armingMode', setAreaArmingMode, "DEPRECATED - use post:/api/areas/:area/:armingMode");
};