var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var site = require('../site');

var controllerHub = require('./lib/controller_hub');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.use(middleware.exposeLocals);

// bind module router
router.all(routeTable.root, site.redirect(routeTable.nativeBridge_root));
router.get(routeTable.nativeBridge_root, controllerHub.index);
router.get(routeTable.account.login, site.redirect(routeTable.account_root + routeTable.account.signIn));

// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge_app + '/:appNumber([0-9]+)', nativeBridge.view);
// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge_app + '/:packageName', nativeBridge.view);
//
// router.post(routeTable.nativeBridge_root + routeTable.nativeBridge_app + '/:appNumber([0-9]+)/order', AccountMiddleware.checkSignedIn, nativeBridge.order);
//
// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge.upload, AccountMiddleware.checkSignedIn, nativeBridge.upload); // in order to avoid conflict with `:page` params
// router.post(routeTable.nativeBridge_root + routeTable.nativeBridge.upload, AccountMiddleware.checkSignedIn, nativeBridge.save);
//
// router.get(routeTable.account_root + routeTable.nativeBridge.list, AccountMiddleware.checkSignedIn, nativeBridge.purchasedAppList);
//
// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge.list, nativeBridge.list);
// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge.list + '/:page([0-9]+)', site.redirect(routeTable.nativeBridge_root + routeTable.nativeBridge.list));
// router.get(routeTable.nativeBridge_root + routeTable.nativeBridge.category + '/:category' , nativeBridge.listByCategory);

module.exports = router;
