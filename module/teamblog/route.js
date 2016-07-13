var express = require('express');

var router = express.Router();

var teamblog = require('./lib/teamblog');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var routeTable = BLITITOR.route;

router.use(middleware.exposeLocals);

router.get(routeTable.teamblog.list, teamblog.list);
router.get(routeTable.teamblog.write, AccountMiddleware.checkSignedIn, teamblog.write); // in order to avoid conflict with `:page` params
router.get(routeTable.teamblog.list + ':page', teamblog.list);
router.get(routeTable.teamblog.list + ':year/:month', teamblog.list);

module.exports = router;
