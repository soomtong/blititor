var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var counter = require('./lib/counter');
var middleware = require('./lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.get(routeTable.admin_root + routeTable.admin.counter, counter.index);

module.exports = router;