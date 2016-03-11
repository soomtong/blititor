var fs = require('fs');
var path = require('path');
var winston = require('winston');

var misc = require('../lib/misc');
var routeTable = misc.routeTable();
var siteThemeType = misc.siteThemeType();

// bind common parameters
function exposeParameter(req, res, next) {
    res.locals.site = {
        theme: BLITITOR.config.site.theme,
        themeType: siteThemeType,
        title: BLITITOR.config.revision,
        url: routeTable.admin_root + req.path
    };
    res.locals.route = routeTable;

    next();
}

function checkDatabaseConfig(req, res, next) {
    if (BLITITOR.tweak.passDBCheckMiddleware || BLITITOR.config.database) {
        next();
    } else {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    }
}

module.exports = {
    exposeParameter: exposeParameter,
    databaseCheck: checkDatabaseConfig
};