var express = require('express');

var router = express.Router();

var teamblog = require('./lib/teamblog');
var middleware = require('./lib/middleware');

var routeTable = BLITITOR.route;

// router.use(middleware.exposeLocals);

router.get(routeTable.teamblog.list, teamblog.list);
router.get(routeTable.teamblog.write, teamblog.write);

module.exports = router;
