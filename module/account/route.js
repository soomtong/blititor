var express = require('express');
var winston = require('winston');

var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

function Strategy(username, password, done) {
    console.log('strategy:');
    console.log(username, password, done);
    /*User.findOne({ username: username }, function (err, user) {
     if (err) { return done(err); }
     if (!user) {
     return done(null, false, { message: 'Incorrect username.' });
     }
     if (!user.validPassword(password)) {
     return done(null, false, { message: 'Incorrect password.' });
     }
     });*/
    var user = {id: 123412341234, username: 'passport', password: '1234'};

    return done(null, user);
}

// serialize and deserialize
function serializeUser(user, done) {
    console.log('serialize account' + user);
    done(null, user.id);
}

function deserializeUser(id, done) {
    /*User.findById(id, function(err, user){
     console.log(user);
     if(!err) done(null, user);
     else done(err, null);
     });*/
    console.log('deserialize by', id);
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