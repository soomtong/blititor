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
router.all(routeTable.root, site.redirect(routeTable.controller_hub_root));
router.get(routeTable.controller_hub_root, controllerHub.index);
router.get(routeTable.account.login, site.redirect(routeTable.account_root + routeTable.account.signIn));

router.get(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/:gatewayID', controllerHub.view);
// router.get(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/:gatewayID([0-9]+)' + '/edit', controllerHub.edit);
//
// router.post(routeTable.controller_hub_root + routeTable.controllerHub_app + '/:appNumber([0-9]+)/order', AccountMiddleware.checkSignedIn, controllerHub.order);
//
// router.get(routeTable.controller_hub_root + routeTable.controllerHub.upload, AccountMiddleware.checkSignedIn, controllerHub.upload); // in order to avoid conflict with `:page` params
// router.post(routeTable.controller_hub_root + routeTable.controllerHub.upload, AccountMiddleware.checkSignedIn, controllerHub.save);
//
// router.get(routeTable.account_root + routeTable.controllerHub.list, AccountMiddleware.checkSignedIn, controllerHub.purchasedAppList);
//
// router.get(routeTable.controller_hub_root + routeTable.controllerHub.list, controllerHub.list);
// router.get(routeTable.controller_hub_root + routeTable.controllerHub.list + '/:page([0-9]+)', site.redirect(routeTable.controller_hub_root + routeTable.controllerHub.list));
// router.get(routeTable.controller_hub_root + routeTable.controllerHub.category + '/:category' , controllerHub.listByCategory);

module.exports = router;
