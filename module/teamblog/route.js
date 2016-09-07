var express = require('express');

var misc = require('../../core/lib/misc');

var teamblog = require('./lib/teamblog');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.use(middleware.exposeLocals);

router.get(routeTable.teamblog_post + '/:postNumber([0-9]+)', teamblog.view);
router.get(routeTable.teamblog_post + '/:postTitle', teamblog.view);

router.get(routeTable.teamblog_root + routeTable.teamblog.write, AccountMiddleware.checkSignedIn, teamblog.write); // in order to avoid conflict with `:page` params
router.post(routeTable.teamblog_root + routeTable.teamblog.write, AccountMiddleware.checkSignedIn, teamblog.save);

router.get(routeTable.teamblog_root + routeTable.teamblog.list, teamblog.list);
router.get(routeTable.teamblog_root + routeTable.teamblog.list + ':page([0-9]+)', teamblog.list);
router.get(routeTable.teamblog_root + routeTable.teamblog.list + ':year([0-9]+)/:month([0-9]+)', teamblog.list);

router.get(routeTable.teamblog_root + routeTable.teamblog_tag.list + '/:tag', teamblog.tag);

module.exports = router;
