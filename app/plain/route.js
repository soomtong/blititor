// load packages
var express = require('express');
var winston = require('winston');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Site = require('../../module/site');
var Admin = require('../../module/administrator');
var Manager = require('../../module/manager');

// load locals
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteTable();

// middleware
router.use(Site.middleware.exposeLocals);
router.use(Admin.middleware.exposeMenu);
router.use(Manager.middleware.exposeMenu);

// route
router.use(Admin.route);       // to manage accounts
router.use(Manager.route);     // to view log module

// bind static page
bindRouter();

module.exports = router;

// functions for private use
function bindRouter() {
    menu.map(function (item) {
        router[item.type || 'get'](item.url, Site.plain);
    });
}