var express = require('express');

var misc = require('../../core/lib/misc');

var chatting = require('./lib/chatting');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.get(routeTable.chatting.root, chatting.index);

module.exports = router;
