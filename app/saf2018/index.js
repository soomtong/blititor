// load packages
var express = require('express');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Site = require('../../module/site');
var Account = require('../../module/account');

// load locals
var app = require('./app.json');
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteData();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
// router.use(Account.middleware.exposeLocals);

// bind module route
router.use('/account', Account.route);
// router.use('/notice', Notice.route);

// bind static page
Site.bindMenu(menu, router);

module.exports = {
    config: app.config,
    exposeLocals: appLocals,
    router: router,
};
