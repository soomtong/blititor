var express = require('express');
var winston = require('winston');

var router = express.Router();

// var adminRoute = require('./admin/route');

var middleware = require('./middleware');
var application = require('../app/' + BLITITOR.config.site.theme);

var routeTable = BLITITOR.route;

// bind admin(manager) route
// router.use(routeTable.admin_root, adminRoute);

// Global middleware
router.use(middleware.exposeLocals);
router.use(middleware.checkDatabase);

// route for application
router.use(application.exposeMenu);     // used for html templates
router.use(application.route);

module.exports = router;