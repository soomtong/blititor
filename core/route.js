var express = require('express');
var winston = require('winston');

var router = express.Router();

var misc = require('./lib/misc');
var adminRoute = require('./admin/route');

var middleware = require('./middleware');
var themePackage = require('../module/' + BLITITOR.config.site.theme);

var routeTable = misc.routeTable();

// bind admin(manager) route
router.use(routeTable.admin_root, adminRoute);

// passport config
var Account = require('../module/account');
var Guestbook = require('../module/guestbook');

router.use(middleware.exposeParameter);
router.use(middleware.checkDatabase);
router.use(themePackage.menu.expose);

// route for Theme's module
var routeList = themePackage.menu.data();

routeList.map(function (item) {
    // expose middleware for each
    if (item.middleware.length) {
        router[item.type](item.url, item.middleware, themePackage.page[item.page]);
    } else {
        router[item.type](item.url, themePackage.page[item.page]);
    }

    // winston.verbose(item);
});

// bind global module
router.use(routeTable.account_root, Account.route);
router.use(routeTable.account_root, Guestbook.route);

module.exports = router;