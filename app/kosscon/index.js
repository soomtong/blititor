// load packages
var express = require('express');
var winston = require('winston');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Account = require('../../module/account');
var Site = require('../../module/site');
var Admin = require('../../module/administrator');
var Manager = require('../../module/manager');
var Counter = require('../../module/counter');

// load locals
var app = require('./app.json');
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteTable();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Account.middleware.exposeLocals);
router.use(Site.middleware.exposeLocals);
router.use(Admin.middleware.exposeMenu);
router.use(Manager.middleware.exposeMenu);

// route
router.use(Admin.route);       // to manage accounts
router.use(Manager.route);     // to view log module

// it uses common feature for each admin and manager, then assign in app router.
// other features use each module's router. eg, modifying account records or log records
router.get(routeTable.account_root + routeTable.account.signOut, Account.signOut);

// no need to count

// need to place down here for except admin page log
router.use(Counter.middleware.sessionCounter);
router.use(Counter.middleware.pageCounter);

// modules
// router.use(routeTable.guestbook_root, Guestbook.route);

// bind static page
Site.bindMenu(menu, router);

module.exports = {
    exposeLocals: appLocals,
    router: router,
};
