var express = require('express');

var misc = require('../../core/lib/misc');

var chatting = require('./lib/chatting');
var middleware = require('./lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(middleware.exposeLocals);

router.get(routeTable.chat.form, chatting.index);

module.exports = router;