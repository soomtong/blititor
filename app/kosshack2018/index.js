// load packages
var express = require('express');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Account = require('../../module/account');
var Site = require('../../module/site');
var Guestbook = require('../../module/guestbook');
var Gallery = require('../../module/gallery');

// load locals
var app = require('./app.json');
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteData();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Account.middleware.exposeLocals);

// route
router.get(routeTable.account.root + routeTable.account.signOut, Account.signOut);
router.use(routeTable.gallery.root, Gallery.route);
router.use(routeTable.guestbook.root, Guestbook.route);

// bind static page
Site.bindMenu(menu, router);

module.exports = {
    config: app.config,
    exposeLocals: appLocals,
    router: router,
};
