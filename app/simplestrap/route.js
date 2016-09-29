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
var Chatting = require('../../module/chatting');

// load own template
var page = require('./page');
var menu = require('./menu');

var router = express.Router();
var routeTable = misc.getRouteTable();

// Theme's middleware
router.use(menu.expose);
router.use(Site.middleware.exposeLocals);

// separated page
router.all(routeTable.root, [middleware.test1, middleware.test2], page.indexPage);

// bind static page
// router.get(routeTable.root, [middleware.test1, middleware.test2], Site.page.index);
router.get(routeTable.about, Site.plain);
router.get(routeTable.chatting, Site.plain);

// bind module
router.use(routeTable.account_root, Account.route);
router.use(routeTable.guestbook_root, Guestbook.route);
router.use(Teamblog.route);
router.use('/lib', Editor.route);   //todo: for test at this time

module.exports = router;