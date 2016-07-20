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

module.exports = router;