var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

// core middleware
var middleware = require('../../core/middleware');

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');
var Guestbook = require('../../module/guestbook');
var Teamblog = require('../../module/teamblog');
var Editor = require('../../module/editor');

winston.info('Bind router for each modules');

// Theme's middleware
router.use(Site.middleware.exposeLocals);

// bind static page
// router.get(routeTable.root, [middleware.test1, middleware.test2], Site.page.index);
router.get(routeTable.about, Site.page.others);

// bind module
router.all(routeTable.root, indexPage);
router.use(routeTable.account_root, Account.route);
router.use(routeTable.guestbook_root, Guestbook.route);
router.use(routeTable.teamblog_root, Teamblog.route);
router.use('/lib', Editor.route);   //todo: for test at this time

module.exports = router;

function indexPage(req, res) {
    var params = {
        title: "Home",
        recentPostCount: 4
    };

    // load recent articles
    Teamblog.recentPost(params, function (error, results) {

        params.recentPostCount = result.count;
        params.recentPostList = results.list;
        res.render(BLITITOR.config.site.theme + '/page/index', params);
    });
}