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
router.get(routeTable.controller_hub_root, AccountMiddleware.checkSignedIn, controllerHub.index);

router.get(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/form', AccountMiddleware.checkSignedIn, controllerHub.gatewayForm);
router.post(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/new', AccountMiddleware.checkSignedIn, controllerHub.newGateway);
router.post(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/new-group', AccountMiddleware.checkSignedIn, controllerHub.newGatewayGroup);

router.get(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/:gatewayID([0-9]+)', AccountMiddleware.checkSignedIn, controllerHub.view);
router.get(routeTable.controller_hub_root + routeTable.controller_hub.gateway + '/:gatewayID([0-9]+)' + '/edit', AccountMiddleware.checkSignedIn, controllerHub.view);

router.get(routeTable.controller_hub_root + routeTable.controller_hub.rtvm + '/new', AccountMiddleware.checkSignedIn, controllerHub.rtvmForm);
router.post(routeTable.controller_hub_root + routeTable.controller_hub.rtvm + '/new', AccountMiddleware.checkSignedIn, controllerHub.newRtvm);

router.post(routeTable.controller_hub_root + routeTable.controller_hub.rtvm + '/:rtvmID/:action', AccountMiddleware.checkSignedIn, controllerHub.rtvm);

module.exports = router;
