// load packages
const express = require('express');

// load cores
const misc = require('../../core/lib/misc');

// load modules
const Site = require('../../module/site');
const Account = require('../../module/account');
const Notice = require('../../module/notice');
const Gallery = require('../../module/gallery');

// load locals
const app = require('./app.json');
const menu = require('./menu');

// init
const router = express.Router();
const routeTable = misc.getRouteData();
const appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Account.middleware.exposeLocals);

// bind module route
router.get(routeTable.account.login, Site.redirect(routeTable.account.root + routeTable.account.signIn));
router.use(routeTable.account.root, Account.site);
router.use(routeTable.notice.root, Notice.site);
router.use(routeTable.gallery.root, Gallery.site);

// bind static page
Site.bindMenu(menu, router);

module.exports = {
    config: app.config,
    exposeLocals: appLocals,
    router: router,
};
