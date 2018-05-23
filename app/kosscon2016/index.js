// load packages
var express = require('express');

// load cores
var misc = require('../../core/lib/misc');

// load modules
var Account = require('../../module/account');
var Site = require('../../module/site');
var Reservation = require('../../module/reservation');
var Gallery = require('../../module/gallery');

// load locals
var app = require('./app.json');
var menu = require('./menu');

// init
var router = express.Router();
var routeTable = misc.getRouteData();
var appLocals = Site.exposeAppLocals(app.locals, menu);

// middleware
router.use(Account.middleware.exposeLocals);

// route
router.get('/account' + routeTable.account.signOut, Account.signOut);
router.use('/gallery', Gallery.route);
router.use('/reservation', Reservation.route);
/*
router.post('/register', function (req, res) {
    console.log(req.body);

    res.redirect('back');
});
*/

// bind static page
router.all('/2016', Site.redirect(routeTable.root));

Site.bindMenu(menu, router);

module.exports = {
    config: app.config,
    exposeLocals: appLocals,
    router: router,
};
