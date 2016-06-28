var express = require('express');
var winston = require('winston');

var router = express.Router();

var Passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var account = require('./lib/account');
var middleware = require('./lib/middleware');
var passoprt = require('./lib/passoprt');

var misc = require('../../core/lib/misc');
var routeTable = misc.routeTable();

// Passport Stuffs
Passport.serializeUser(passoprt.serialize);
Passport.deserializeUser(passoprt.deserialize);
Passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, passoprt.authenticate));

router.use(middleware.exposeLocals);

router.post(routeTable.account.login, Passport.authenticate('local', {
        failureRedirect: '/account/sign-in',
        badRequestMessage: '아이디 또는 비밀번호를 입력해주세요.',
        failureFlash: '아이디 또는 비밀번호가 정확하지 않습니다!'
    }), passoprt.loginSuccess, passoprt.loginDone
);

router.post(routeTable.account.register, account.register);

router.get(routeTable.account.info, middleware.checkSignedIn, account.infoForm);
router.post(routeTable.account.updateInfo, middleware.checkSignedIn, account.updateInfo);

module.exports = router;