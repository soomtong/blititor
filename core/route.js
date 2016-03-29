var express = require('express');
var winston = require('winston');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var router = express.Router();

var middleware = require('./middleware');
var themePackage = require('../module/' + BLITITOR.config.site.theme);

router.use(middleware.exposeParameter);
router.use(themePackage.menu.expose);

// passport config
var Account = require('../module/account');
passport.use(new LocalStrategy(Account.localStrategy));
passport.serializeUser(Account.passport.serializer);
passport.deserializeUser(Account.passport.deserializer);

router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log('hi');
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.user);
    // res.redirect('/');
    res.send('just signed in!');
});

// route for each modules
var routeList = themePackage.menu.data();

routeList.map(function (item) {
    // expose middleware for each
    if (item.middleware.length) {
        var m = item.middleware;
        m.map(function (item) {
            if (item) router.use(middleware[item]);
        });
    }

    winston.verbose(item);

    router[item.type](item.url, themePackage.page[item.page]);
});

module.exports = router;