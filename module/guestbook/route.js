var express = require('express');
var winston = require('winston');

var router = express.Router();

var guestbook = require('./lib/guestbook');
var middleware = require('./lib/middleware');

var misc = require('../../core/lib/misc');
var routeTable = misc.routeTable();

router.use(middleware.exposeLocals);

router.post(routeTable.account.register, guestbook.register);

module.exports = router;