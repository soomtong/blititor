var express = require('express');
var middleware = require('./middleware');
var misc = require('../lib/misc');

var router = express.Router();
var routeTable = misc.routeTable();

function index(req, res, next) {
    res.send(BLITITOR.config);
}

function databaseSetup(req, res, next) {
    var params = {
        title: BLITITOR.config.author
    };

    // load theme folder as it's condition
    res.render(BLITITOR.config.site.theme + '/setup/setup-database', params);
}

router.get(routeTable.root, middleware.databaseCheck, index);
router.get(routeTable.database_setup, middleware.bypassDatabase, databaseSetup);

// display default route table
misc.showRouteTable(routeTable);

module.exports = router;