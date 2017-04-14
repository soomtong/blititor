var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var site = require('../site');

var appstore = require('./lib/appstore');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.use(middleware.exposeLocals);

// bind module router
router.all(routeTable.root, site.redirect(routeTable.appstore_root));
router.get(routeTable.account.login, site.redirect(routeTable.account_root + routeTable.account.signIn));
router.get(routeTable.appstore_root, appstore.index);

router.get(routeTable.appstore_root + routeTable.appstore_app + '/:appNumber([0-9]+)', appstore.view);
router.get(routeTable.appstore_root + routeTable.appstore_app + '/:packageName', appstore.view);

router.get(routeTable.appstore_root + routeTable.appstore.write, AccountMiddleware.checkSignedIn, appstore.write); // in order to avoid conflict with `:page` params
router.post(routeTable.appstore_root + routeTable.appstore.write, AccountMiddleware.checkSignedIn, appstore.save);

router.get(routeTable.appstore_root + routeTable.appstore.list, appstore.list);
router.get(routeTable.appstore_root + routeTable.appstore.list + '/:page([0-9]+)', site.redirect(routeTable.appstore_root + routeTable.appstore.list));
router.get(routeTable.appstore_root + routeTable.appstore.category + '/:category' , appstore.listByCategory);

module.exports = router;
