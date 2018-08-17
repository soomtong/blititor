const fs = require('fs');
const path = require('path');

const express = require('express');
const winston = require('winston');

const theme = require('./lib/theme');
const misc = require('./lib/misc');
const middleware = require('./middleware');
const application = require('../app/' + BLITITOR.site.app);
const site = require('../module/site');
const admin = require('../module/administrator');
const manage = require('../module/manager');
const counter = require('../module/counter');

// extend router
const router = express.Router();
const routeTable = misc.getRouteData();

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
// theme.bindFavicon(router, BLITITOR.site.theme);
router.use(theme.getFavicon(BLITITOR.site.theme));

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
    const statusMonitor = require('express-status-monitor');

    router.use(statusMonitor({path: '/system/status'}));
}

// error Handler
router.use(theme.get404Handler(BLITITOR.site.theme));
router.use(theme.get500Handler(BLITITOR.site.theme));

module.exports = router;