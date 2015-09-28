var express = require('express');
var middleware = require('./middleware');
var misc = require('../lib/misc');

var router = express.Router();
var routeTable = misc.routeTable();

function databaseSetup(req, res, next) {
    var params = {
        siteTheme: BLITITOR.config.site.theme + '/setup',
        siteTitle: BLITITOR.config.revision
    };

    // load theme folder as it's condition
    res.render(params.siteTheme + '/setup-database', params);
}

router.get(routeTable.admin.database_setup, middleware.bypassDatabase, databaseSetup);

module.exports = router;