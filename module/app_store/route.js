var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var site = require('../site');

var appstore = require('./lib/appstore');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(middleware.exposeLocals);

// bind module router
router.get(routeTable.account.login, site.redirect('/account' + routeTable.account.signIn));

router.all(routeTable.root, site.redirect(routeTable.appstore_root));
router.get(routeTable.appstore_root, appstore.index);

router.get(routeTable.appstore_root + routeTable.appstore_app + '/:appNumber([0-9]+)', appstore.view);
router.get(routeTable.appstore_root + routeTable.appstore_app + '/:packageName', appstore.view);

router.post(routeTable.appstore_root + routeTable.appstore_app + '/:appNumber([0-9]+)/order', AccountMiddleware.checkSignedIn, appstore.order);

router.get(routeTable.appstore_root + routeTable.appstore.upload, AccountMiddleware.checkSignedIn, appstore.upload); // in order to avoid conflict with `:page` params
router.post(routeTable.appstore_root + routeTable.appstore.upload, AccountMiddleware.checkSignedIn, appstore.save);

router.get('/account' + routeTable.appstore.list, AccountMiddleware.checkSignedIn, appstore.purchasedAppList);

router.get(routeTable.appstore_root + routeTable.appstore.list, appstore.list);
router.get(routeTable.appstore_root + routeTable.appstore.list + '/:page([0-9]+)', site.redirect(routeTable.appstore_root + routeTable.appstore.list));
router.get(routeTable.appstore_root + routeTable.appstore.category + '/:category' , appstore.listByCategory);

module.exports = router;
