var express = require('express');

var misc = require('../../core/lib/misc');

var teamblog = require('./lib/teamblog');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(middleware.exposeLocals);

router.get(routeTable.teamblog.post + '/:postNumber([0-9]+)', teamblog.view);
router.get(routeTable.teamblog.post + '/:postTitle', teamblog.view);

router.get(routeTable.teamblog.write, AccountMiddleware.checkSignedIn, teamblog.write); // in order to avoid conflict with `:page` params
router.post(routeTable.teamblog.write, AccountMiddleware.checkSignedIn, teamblog.save);

router.get(routeTable.teamblog.list, teamblog.list);
router.get(routeTable.teamblog.list + ':page([0-9]+)', teamblog.list);
router.get(routeTable.teamblog.list + ':year([0-9]+)/:month([0-9]+)', teamblog.list);
router.get(routeTable.teamblog.tag.list + '/:tag' , teamblog.list);

module.exports = router;
