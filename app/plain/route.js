var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

var menu = require('./menu');

// core middleware
var middleware = require('../../core/middleware');

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');  // this is necessary for session system

// Theme's middleware

// bind static page
router.all(routeTable.root, Site.index);

// todo: design like this
// router.use(Site.bindPlain(router, menu.expose));

menu.map(function (item) {
    console.log(item);
    if (item.middleware && item.middleware.length) {
        router[item.type || 'get'](item.url, item.middleware, Site.plain);
    } else {
        router[item.type || 'get'](item.url, Site.plain);
    }
});

// bind module
// router.use(routeTable.account_root, Account.route);

module.exports = router;