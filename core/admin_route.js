var express = require('express');
var misc = require('../lib/misc');

var database = require('./admin/database');
var middleware = require('./admin/middleware');

var router = express.Router();
var routeTable = misc.routeTable();

router.use(middleware.bypassDatabase);
router.use(middleware.setupMiddleware);
router.get(routeTable.admin.database_setup, database.databaseSetup);

module.exports = router;