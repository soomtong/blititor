var express = require('express');

var misc = require('../../core/lib/misc');

var chatting = require('./lib/chatting');
var middleware = require('./lib/middleware');

var router = express.Router();
var routeData = require('./route.json');
var routeTable = misc.getRouteTable(routeData);

router.use(middleware.exposeLocals);

router.get(routeTable.chat.form, chatting.index);

module.exports = router;