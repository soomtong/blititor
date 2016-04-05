var express = require('express');
var winston = require('winston');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var router = express.Router();

var middleware = require('./middleware');
var themePackage = require('../module/' + BLITITOR.config.site.theme);

router.use(middleware.exposeParameter);
router.use(themePackage.menu.expose);

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

// passport config
var Account = require('../module/account');
passport.use(new Strategy({usernameField: 'email', passwordField: 'password'}, Account.localStrategy));
passport.serializeUser(Account.passport.serializer);
passport.deserializeUser(Account.passport.deserializer);

router.post('/account/login', passport.authenticate('local', {
    failureRedirect: '/account/sign-in',
    badRequestMessage: '아이디 또는 비밀번호가 정확하지 않습니다.',
    failureFlash: true
}), function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.user);
    // res.redirect('/');
    res.send('just signed in!');
});

module.exports = router;