var express = require('express');
var winston = require('winston');

var router = express.Router();

var adminRoute = require('./admin/route');

var middleware = require('./middleware');
var application = require('../app/' + BLITITOR.config.site.theme);

var routeTable = BLITITOR.route;

// bind admin(manager) route
router.use(routeTable.admin_root, adminRoute);

// Global middleware
router.use(middleware.exposeLocals);
router.use(middleware.checkDatabase);
router.use(application.menu.expose);

// route for Theme's module
var routeList = application.menu.data();
var pageList = application.page;

routeList.map(function (item) {
    // expose middleware for each
    if (item.page) {
        if (item.middleware.length) {
            router[item.type](item.url, item.middleware, pageList[item.page]);
        } else {
            router[item.type](item.url, pageList[item.page]);
        }
    }

    // winston.verbose(item);
});

router.use(application.route);

module.exports = router;