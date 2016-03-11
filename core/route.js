var express = require('express');
var middleware = require('./middleware');
var misc = require('../lib/misc');

// load default modules
var site = require('../module/site');

var router = express.Router();
var routeTable = misc.routeTable();

router.use(middleware.exposeParameter);

router.get(routeTable.root, middleware.databaseCheck, site.index);

routeTable.pages.map(function (r) {
    router.get('/' + r, site.pages);
});

module.exports = router;