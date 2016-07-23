var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var administrator = require('./lib/administrator');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.get(routeTable.admin_root + routeTable.admin.login, administrator.loginForm);
router.post(routeTable.admin_root + routeTable.admin.login, administrator.loginProcess);

// caution. use each middleware for other module's router. it affects all router exist behind
router.all(routeTable.admin_root, AccountMiddleware.checkAdministrator, administrator.index);
router.get(routeTable.admin_root + routeTable.admin.account, AccountMiddleware.checkAdministrator, administrator.index);
router.get(routeTable.admin_root + routeTable.admin.accountNew, AccountMiddleware.checkAdministrator, administrator.accountView);
router.get(routeTable.admin_root + routeTable.admin.account + '/:uuid', AccountMiddleware.checkAdministrator, administrator.accountView);
router.get(routeTable.admin_root + routeTable.admin.accountEdit + '/:uuid', AccountMiddleware.checkAdministrator, administrator.accountForm);
router.post(routeTable.admin_root + routeTable.admin.account + '/:uuid', AccountMiddleware.checkAdministrator, administrator.accountProcess);

module.exports = router;