var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

var menu = require('./menu');

// custom middleware

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');  // mandatory for session system
var Admin = require('../../module/administrator');
var Manager = require('../../module/manager');

var bindRouter = function () {
    menu.map(function (item) {
        router[item.type || 'get'](item.url, Site.plain);
    });
};

router.use(Site.middleware.exposeLocals);
router.use(Admin.middleware.exposeMenu);
router.use(Manager.middleware.exposeMenu);

router.use(Admin.route);       // manage accounts
router.use(routeTable.manager_root, Account.middleware.checkManager, Manager.route);     // to view log module

// bind static page
bindRouter();

module.exports = router;
