var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');
var Guestbook = require('../../module/guestbook');
var Teamblog = require('../../module/teamblog');
var Editor = require('../../module/editor');

winston.info('Bind router for each modules');

// Theme's middleware
router.use(Site.middleware.exposeLocals);

// bind global module
// todo: filtering by ignore flag in `module_list.json`
router.use(routeTable.account_root, Account.route);
router.use(routeTable.guestbook_root, Guestbook.route);
router.use(routeTable.teamblog_root, Teamblog.route);
router.use('/lib', Editor.route);

module.exports = router;
