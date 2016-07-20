var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var manager = require('./lib/manager');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.all(routeTable.manage_root, AccountMiddleware.checkManager, manager.index);

router.get(routeTable.manage_root + routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage_root + routeTable.manage.login, manager.loginProcess);

module.exports = router;