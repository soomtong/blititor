var express = require('express');
var middleware = require('./middleware');
var misc = require('../lib/misc');
var routeTable = misc.routeTable();

var router = express.Router();

function index(req, res, next) {
    res.send(BLITITOR.config);
}

function databaseSetup(req, res, next) {
    res.send('setup DB, setup Admin Account');
}

router.get(routeTable['root'], middleware.databaseCheck, index);
router.get(routeTable['database_setup'], middleware.bypassDatabase, databaseSetup);

// display default route table
misc.showRouteTable(routeTable);

module.exports = router;