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
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteTable();

// middleware
router.use(menu.expose);
router.use(Account.middleware.exposeLocals);
router.use(Site.middleware.exposeLocals);
router.use(Admin.middleware.exposeMenu);
router.use(Manager.middleware.exposeMenu);

// route
router.use(Admin.route);       // to manage accounts
router.use(Manager.route);     // to view log module

// need to place down here for except admin page log
router.use(Counter.middleware.sessionCounter);
router.use(Counter.middleware.pageCounter);

// bind static page
router.all(routeTable.root, Site.index);
router.all(routeTable.about, Site.redirect(routeTable.root));

// bind module
router.use(routeTable.account_root, Account.route);

module.exports = router;
