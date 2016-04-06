var express = require('express');
var winston = require('winston');

var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var common = require('../../lib/common');

function Strategy(username, password, done) {   // done(error, user, info)
    winston.debug(username, password);
    /*User.findOne({ username: username }, function (err, user) {
     if (err) { return done(err); }
     if (!user) {
     return done(null, false, { message: 'Incorrect username.' });
     }
     if (!user.validPassword(password)) {
     return done(null, false, { message: 'Incorrect password.' });
     }
     });*/

    if (username == 'soomtong@gmail.com') {
        return done(null, common.testUser);
    } else {
        return done(null, false, {message: 'Incorrect username or password'});
    }
}

// serialize and deserialize
function serializeUser(user, done) {
    winston.debug('serialize account' + user);
    done(null, user.id);
}

function deserializeUser(id, done) {
    /*User.findById(id, function(err, user){
     console.log(user);
     if(!err) done(null, user);
     else done(err, null);
     });*/
    winston.debug('deserialize by', id);
    var user = {username: 'passport', password: '1234'};
    done(null, user);
}

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, Strategy));
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

router.post('/account/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/account/sign-in',
    badRequestMessage: '아이디 또는 비밀번호가 정확하지 않습니다.',
    failureFlash: true
}));

module.exports = router;