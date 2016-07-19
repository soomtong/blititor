var fs = require('fs');
var winston = require('winston');

var userPrivilege = require('../config/user_level.json');
var defaultRoute = require('../config/route_default.json');

function setUserPrivilege() {
    BLITITOR.userPrivilege = userPrivilege;

    return BLITITOR.userPrivilege;
}

function setRouteTable() {
    BLITITOR.route = defaultRoute;

    return BLITITOR.route;
}

// deprecated
function setRoutePage() {
    var theme = BLITITOR.config.site.theme;
    BLITITOR.route = defaultRoute;

    //read theme page folder and merge default route
    //todo: this method will be removed
    try {
        var files = fs.readdirSync('./theme/' + theme + '/page');

        winston.verbose('pages in page folder', files);

        BLITITOR.route.pages = files.filter(function (file) {
            return file.indexOf('.html') && file.indexOf('_') !== 0 && file.indexOf('include') == -1
        }).map(function (file) {
            return file.replace('.html', '');
        });

    } catch (e) {
        winston.error('Default theme is not exist');
    }
}

function siteThemeType() {
    return {
        setup: 'setup',
        admin: 'admin',
        manage: 'manage'
    };
}

function showRouteTable(routeTable) {
    winston.info("\x1B[32m=== load default route table ===\033[0m");

    winston.verbose(JSON.stringify(routeTable, null, 4));
}

module.exports = {
    setRouteTable: setRouteTable,
    setUserPrivilege: setUserPrivilege,
    setRoutePage: setRoutePage,
    siteThemeType: siteThemeType,
    showRouteTable: showRouteTable
};