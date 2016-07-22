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

// load locals
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteTable();

// middleware
router.use(Account.middleware.exposeLocals);
router.use(Site.middleware.exposeLocals);
router.use(Admin.middleware.exposeMenu);
router.use(Manager.middleware.exposeMenu);

// it uses common feature for each admin and manager, then assign in app router.
// other features use each module's router. eg, modifying account records or log records
router.get(routeTable.account_root + routeTable.account.signOut, Account.signOut);
router.post(routeTable.account_root + routeTable.account.registerSimple, Account.registerSimple);

// bind static page
bindRouter();

// route
router.use(Admin.route);       // to manage accounts
router.use(Manager.route);     // to view log module

module.exports = router;

// functions for private use
function bindRouter() {
    menu.map(function (item) {
        router[item.type || 'get'](item.url, Site.plain);
    });
}