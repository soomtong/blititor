var express = require('express');

var misc = require('../../core/lib/misc');

var notice = require('./lib/notice');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(middleware.exposeLocals);

router.all(routeTable.notice.list, notice.list);
// router.post(routeTable.notice.write, AccountMiddleware.checkManager, notice.register);
// router.get(routeTable.notice.view, notice.view);

module.exports = router;