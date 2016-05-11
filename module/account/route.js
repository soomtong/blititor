var express = require('express');
var winston = require('winston');

var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var account = require('./lib/account');
var middleware = require('./lib/middleware');

var misc = require('../../core/lib/misc');
var routeTable = misc.routeTable();

// Passport Stuffs
passport.serializeUser(account.serialize);
passport.deserializeUser(account.deserialize);
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, account.authenticate));

router.use(middleware.exposeLocals);

router.post(routeTable.account.login, passport.authenticate('local', {
        failureRedirect: '/account/sign-in',
        badRequestMessage: '아이디 또는 비밀번호를 입력해주세요.',
        failureFlash: '아이디 또는 비밀번호가 정확하지 않습니다!'
    }), account.loginSuccess, account.loginDone
);

router.post(routeTable.account.register, account.register);

router.get(routeTable.account.info, middleware.checkSignedIn, account.infoForm);
router.post(routeTable.account.updateInfo, middleware.checkSignedIn, account.updateInfo);

module.exports = router;