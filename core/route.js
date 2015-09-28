var express = require('express');
var middleware = require('./middleware');
var misc = require('../lib/misc');

var router = express.Router();
var routeTable = misc.routeTable();

function index(req, res, next) {
    res.send(BLITITOR.config);
}

router.get(routeTable.root, middleware.databaseCheck, index);

module.exports = router;