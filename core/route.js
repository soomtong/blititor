var express = require('express');
var winston = require('winston');

var misc = require('./lib/misc');
var middleware = require('./middleware');

var application = require('../app/' + BLITITOR.config.site.app);

var router = express.Router();
var routeTable = misc.getRouteTable();

// bind admin(manager) route
// router.use(routeTable.admin_root, adminRoute);

// Global middleware
router.use(middleware.exposeLocals);
router.use(middleware.checkDatabase);

// route for application
router.use(application.exposeMenu);     // used for html templates
router.use(application.route);

module.exports = router;