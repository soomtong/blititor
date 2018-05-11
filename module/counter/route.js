var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var counter = require('./lib/counter');
var middleware = require('./lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

router.get('/admin' + routeTable.admin.counter, counter.index);

module.exports = router;