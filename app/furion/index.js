// load packages
var express = require('express');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Site = require('../../module/site');
var Teamblog = require('../../module/teamblog');
var Account = require('../../module/account');

// load locals
var app = require('./app.json');
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteData();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Account.middleware.exposeLocals);
// router.use(Site.middleware.cacheControl);
router.use(Site.middleware.exposeLocals);

// bind static page
router.all(routeTable.root, Teamblog.index);
router.all('/about', Site.redirect(routeTable.root));

// bind module
router.all('/account', Site.redirect('/'));
router.use('/account', Account.route);
router.all('/blog', Site.redirect('/'));
router.use('/blog', Teamblog.route);

module.exports = {
    config: app.config,
    exposeLocals: appLocals,
    router: router,
};
