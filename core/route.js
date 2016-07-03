var express = require('express');
var winston = require('winston');

var router = express.Router();

var adminRoute = require('./admin/route');

var middleware = require('./middleware');
var application = require('../app/' + BLITITOR.config.site.theme);

var routeTable = BLITITOR.route;

// bind admin(manager) route
router.use(routeTable.admin_root, adminRoute);

// load modules for router
var Site = require('../module/site');
var Account = require('../module/account');
var Guestbook = require('../module/guestbook');
var Editor = require('../module/editor');

// Global middleware
router.use(middleware.exposeLocals);
router.use(middleware.checkDatabase);
router.use(application.menu.expose);

// Theme's middleware
router.use(Site.middleware.exposeLocals);

// route for Theme's module
var routeList = application.menu.data();
var pageList = application.page;

routeList.map(function (item) {
    // expose middleware for each
    if (item.route) {
        if (item.middleware.length) {
            router[item.type](item.url, item.middleware, pageList[item.page]);
        } else {
            router[item.type](item.url, pageList[item.page]);
        }
    }

    // winston.verbose(item);
});

// bind global module
// todo: filtering by ignore flag in `module_list.json`
router.use(routeTable.account_root, Account.route);
router.use(routeTable.guestbook_root, Guestbook.route);
router.use('/lib', Editor.route);

module.exports = router;