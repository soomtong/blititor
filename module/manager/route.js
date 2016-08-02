var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var manager = require('./lib/manager');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.get(routeTable.manage_root + routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage_root + routeTable.manage.login, manager.loginProcess);

// caution. use each middleware for other module's router. it affects all router exist behind
router.all(routeTable.manage_root,                                 AccountMiddleware.checkManager, manager.pageViewCounter);
router.all(routeTable.manage_root + routeTable.manage.pageCounter, AccountMiddleware.checkManager, manager.pageViewCounter);
router.get(routeTable.manage_root + routeTable.manage.pageLog, AccountMiddleware.checkManager, manager.pageViewLog);
router.get(routeTable.manage_root + routeTable.manage.account, AccountMiddleware.checkManager, manager.accountList);
router.get(routeTable.manage_root + routeTable.manage.accountCounter, AccountMiddleware.checkManager, manager.accountActionCounter);

module.exports = router;