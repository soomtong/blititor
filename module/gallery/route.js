var express = require('express');

var misc = require('../../core/lib/misc');

var gallery = require('./lib/gallery');
var middleware = require('./lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.use(middleware.exposeLocals);

// router.get(routeTable.gallery.form, gallery.index);

module.exports = router;