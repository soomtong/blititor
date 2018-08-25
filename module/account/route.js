const express = require('express');
const winston = require('winston');

const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const misc = require('../../core/lib/misc');

const account = require('./lib/account');
const middleware = require('./lib/middleware');
const passport = require('./lib/passport');

const routeTable = misc.getRouteData();
const site = express.Router();

// Passport Stuffs
const passportLocalOptions = {
    failureRedirect: '/account' + routeTable.account.signIn,
    badRequestMessage: '아이디 또는 비밀번호를 입력해주세요!',
    failureFlash: true,
};

Passport.use(new LocalStrategy({ usernameField: 'account_id', passwordField: 'account_password' }, passport.authenticate));
Passport.serializeUser(passport.serialize);
Passport.deserializeUser(passport.deserialize);

// router.use(middleware.exposeLocals); it used in app level not route level

site.get('/', account.signIn);
site.get(routeTable.account.signIn, account.signIn);
site.get(routeTable.account.signUp, middleware.checkLoggedSession, account.signUp);
site.get(routeTable.account.signOut, account.signOut);
site.post(routeTable.account.checkToken, account.checkToken);

site.post(routeTable.account.login, Passport.authenticate('local', passportLocalOptions), passport.loginSuccess, passport.loginDone);
site.post(routeTable.account.register, account.register);

site.get(routeTable.account.info, middleware.checkSignedIn, account.infoForm);
site.post(routeTable.account.updateInfo, middleware.checkSignedIn, account.updateInfo);

module.exports = { site };