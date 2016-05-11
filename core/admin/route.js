var express = require('express');
var misc = require('../lib/misc');

var database = require('./database');
var theme = require('./theme');
var middleware = require('./middleware');

var connection = require('../lib/connection');

var router = express.Router();
var routeTable = misc.routeTable();

var redirect = {
    databaseSetup: function (req, res) {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    }
};

var db = connection.get();

router.use(middleware.exposeParameter);

router.get(routeTable.admin.install, redirect.databaseSetup);
router.get(routeTable.admin.database_setup, middleware.checkDatabaseConfiguration, database.databaseSetupView);
router.post(routeTable.admin.database_setup, database.databaseSetup);

router.get(routeTable.admin.database_init, middleware.checkDatabaseInitialization, database.databaseInitView);
router.post(routeTable.admin.database_init, database.databaseInit);

router.get(routeTable.admin.theme_setup, theme.themeSetupView);
router.post(routeTable.admin.theme_setup, theme.themeSetup);

// utility
router.get('/connections', function (req, res) {
    console.log(db.client.pool.stats());

    res.send(db.client.pool.stats());
});

module.exports = router;