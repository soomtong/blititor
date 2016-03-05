var express = require('express');
var misc = require('../lib/misc');

var database = require('./admin/database');
var middleware = require('./admin/middleware');

var router = express.Router();
var routeTable = misc.routeTable();

var redirect = {
    databaseSetup: function (req, res) {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    }
};

router.use(middleware.exposeParameter);

router.get(routeTable.admin.install, redirect.databaseSetup);
router.get(routeTable.admin.database_setup, middleware.checkDatabaseConfiguration, database.databaseSetupView);
router.post(routeTable.admin.database_setup, database.databaseSetup);

router.get(routeTable.admin.database_init, middleware.checkDatabaseInitialization, database.databaseInitView);
router.post(routeTable.admin.database_init, database.databaseInit);

router.get(routeTable.admin.theme_setup, theme.themeSetupView);
router.post(routeTable.admin.theme_setup, theme.themeSetup);

module.exports = router;