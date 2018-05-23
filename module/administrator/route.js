var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var administrator = require('./lib/administrator');
var middleware = require('./lib/middleware');

var Account = require('../account');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(Account.middleware.exposeLocals);

router.get(routeTable.admin.login, administrator.loginForm);
router.post(routeTable.admin.login, administrator.loginProcess);

// caution. use each middleware for other module's router. it affects all router exist behind
router.get('/', Account.middleware.checkAdministrator, administrator.accountList);
router.get(routeTable.admin.account, Account.middleware.checkAdministrator, administrator.accountList);
router.get(routeTable.admin.accountNew, Account.middleware.checkAdministrator, administrator.accountView);
router.post(routeTable.admin.accountAdd, Account.middleware.checkAdministrator, Account.registerSimple);
router.get(routeTable.admin.account + '/:uuid', Account.middleware.checkAdministrator, administrator.accountView);
router.get(routeTable.admin.accountEdit + '/:uuid', Account.middleware.checkAdministrator, administrator.accountForm);
router.post(routeTable.admin.accountEdit + '/:uuid', Account.middleware.checkAdministrator, administrator.accountProcess);

module.exports = router;