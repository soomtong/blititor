var express = require('express');
var winston = require('winston');

var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var account = require('./account');

// Passport Stuffs
passport.serializeUser(account.serialize);
passport.deserializeUser(account.deserialize);
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, account.authenticate));

router.post('/account/login', passport.authenticate('local', {
        failureRedirect: '/account/sign-in',
        badRequestMessage: '아이디 또는 비밀번호를 입력해주세요.',
        failureFlash: '아이디 또는 비밀번호가 정확하지 않습니다!'
    }), account.loginSuccess, account.loginDone
);

router.post('/account/register', account.register);

router.get('/account/info', account.infoForm);
router.post('/account/info', account.info);

module.exports = router;