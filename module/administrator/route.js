var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var administrator = require('./lib/administrator');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.all(routeTable.admin_root, AccountMiddleware.checkAdministrator, administrator.index);

router.get(routeTable.admin_root + routeTable.admin.login, administrator.loginForm);
router.post(routeTable.admin_root + routeTable.admin.login, administrator.loginProcess);

router.get(routeTable.admin_root + routeTable.admin.account, administrator.index);
router.get(routeTable.admin_root + routeTable.admin.newAccount, administrator.accountForm);
router.get(routeTable.admin_root + routeTable.admin.account + '/:uuid', administrator.accountForm);
router.post(routeTable.admin_root + routeTable.admin.account + '/:uuid', administrator.accountProcess);

module.exports = router;