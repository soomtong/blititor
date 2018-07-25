var fs = require('fs');
var path = require('path');

var express = require('express');
var winston = require('winston');

var theme = require('./lib/theme');
var misc = require('./lib/misc');
var middleware = require('./middleware');
var application = require('../app/' + BLITITOR.config.site.app);
var site = require('../module/site');
var admin = require('../module/administrator');
var manage = require('../module/manager');
var counter = require('../module/counter');

// extend router
var router = express.Router();
var routeTable = misc.getRouteData();

// Global locals and middleware
router.use(middleware.exposeLocals);
router.use(middleware.cacheControl);    // for global use
router.use(middleware.checkDatabase);

// Application locals. e.g app menus, user, message
router.use(application.exposeLocals);
router.use(site.middleware.exposeLocals);

// route for admin or manage
if (application.config && application.config['admin']) {
    router.use(routeTable.admin.root, admin.middleware.exposeLocals, admin.route);
    winston.info('Enabled administrator module to /admin');
}
if (application.config && application.config['manage']) {
    router.use(routeTable.manage.root, manage.middleware.exposeLocals, manage.route);
    winston.info('Enabled manager module to /manage');
}

// route for vendor static files
if (application.config && application.config['vendor']) {
    application.config.vendor.map(function (vendor) {
        winston.info('bound static library: \'' + vendor + '\' to ' + misc.vendorMap(vendor));

        router.use('/vendor/' + vendor, express.static(misc.vendorMap(vendor)));
    });
}

// Favicon
// theme.bindFavicon(router, BLITITOR.config.site.theme);
router.use(theme.getFavicon(BLITITOR.config.site.theme));

// need to place down here for excluding counters
if (application.config && (application.config['admin'] || application.config['manage'])) {
    // init global counter
    router.use(counter.middleware.sessionCounter);
    router.use(counter.middleware.pageCounter);
    winston.info('Enabled global counter {session, page}');
}

// route for application
router.use(application.router);

// Extension
if (BLITITOR.env !== 'production') { // Only in dev environment
    var statusMonitor = require('express-status-monitor');

    router.use(statusMonitor({path: '/system/status'}));
}

// error Handler
router.use(theme.get404Handler(BLITITOR.config.site.theme));
router.use(theme.get500Handler(BLITITOR.config.site.theme));

module.exports = router;