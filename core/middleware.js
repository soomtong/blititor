//var fs = require('fs');
//var path = require('path');
var winston = require('winston');

var misc = require('./lib/misc');

var routeTable = BLITITOR.route;
var siteThemeType = misc.siteThemeType();

// bind common parameters
function exposeLocals(req, res, next) {
    res.locals.site = {
        theme: BLITITOR.config.site.theme,
        themeType: siteThemeType,
        title: BLITITOR.config.revision,
        url: req.path
    };
    
    res.locals.route = routeTable;

    winston.verbose('bind locals in core: {site, route}');
    next();
}

function checkDatabaseConfig(req, res, next) {
    if (BLITITOR.tweak.passDBCheckMiddleware || BLITITOR.config.database) {
        next();
    } else {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    }
}

function testMiddleware1(req, res, next) {
    console.log('Route Middleware Test Method 1');
    next();
}

function testMiddleware2(req, res, next) {
    console.log('Route Middleware Test Method 2');
    next();
}

module.exports = {
    test1: testMiddleware1,
    test2: testMiddleware2,
    exposeLocals: exposeLocals,
    checkDatabase: checkDatabaseConfig
};