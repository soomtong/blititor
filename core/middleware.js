const winston = require('winston');

const misc = require('./lib/misc');

const routeTable = misc.getRouteData();
const siteThemeType = misc.siteThemeType();

// bind common parameters
function exposeLocals(req, res, next) {
    res.locals.site = {
        env: BLITITOR.env,
        root: BLITITOR.site.service.url_prefix, // url_prefix shouldn't end with '/'
        theme: BLITITOR.site.service.url_prefix + '/' +BLITITOR.site.theme,
        adminTheme: BLITITOR.site.service.url_prefix + '/' +BLITITOR.site.adminTheme,
        manageTheme: BLITITOR.site.service.url_prefix + '/' +BLITITOR.site.manageTheme,
        themeType: siteThemeType,
        title: BLITITOR.site.title,
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
        res.redirect('/admin' + routeTable.admin.database_setup);
    }
}

// Browser Cache Control
function cacheControl(req, res, next) {
    if (BLITITOR.config['cacheControl']) {
        res.set({
            'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
            'Pragma': 'no-cache',
            'Keep-Alive': 'timeout=3, max=993',
        });

        winston.verbose('set header with no-cache');
    }

    next();
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
    cacheControl: cacheControl,
    checkDatabase: checkDatabaseConfig,
};