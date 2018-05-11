var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');
var middleware = require('../../core/middleware');

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');
var Guestbook = require('../../module/guestbook');
var Teamblog = require('../../module/teamblog');
var Editor = require('../../module/editor');

// load locals
var app = require('./app.json');
var menu = require('./menu');
var page = require('./page');

// init
var router = express.Router();
var routeTable = misc.getRouteData();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Site.middleware.exposeLocals);

// separated page
router.all(routeTable.root, [middleware.test1, middleware.test2], page.indexPage);

// bind static page
// router.get(routeTable.root, [middleware.test1, middleware.test2], Site.page.index);
// router.get(routeTable.about, Site.bindMenu);
Site.bindMenu(menu, router);

// bind module
router.use('/account', Account.route);
router.use(routeTable.guestbook_root, Guestbook.route);
router.use(Teamblog.route);
router.use('/lib', Editor.route);   //todo: for test at this time

module.exports = {
    exposeLocals: appLocals,
    router: router,
};
