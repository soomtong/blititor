var express = require('express');
//var winston = require('winston');

var middleware = require('./middleware');
var misc = require('./misc');

// load default modules
var site = require('../module/site');

var router = express.Router();
var routeTable = misc.routeTable();

router.use(middleware.exposeParameter);
router.use(site.exposeMenu);

router.get(routeTable.root, middleware.databaseCheck, site.pages);

routeTable.pages.map(function (r) {
    router.get('/' + r, site.pages);
});

module.exports = router;