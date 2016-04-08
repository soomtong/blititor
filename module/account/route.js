var express = require('express');
var winston = require('winston');

var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var common = require('../../lib/common');

/* Fake, in-memory database of users */

var users = [
    {id: 1, username: 'bob', password: 'secret', email: 'bob@example.com', level: 1},
    {id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com', level: 1},
    {id: 3, username: 'soomtong@gmail.com', password: '123', email: 'soomtong@example.com', level: 9}
];

function findById(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
        fn(null, users[idx]);
    } else {
        fn(new Error('User ' + id + ' does not exist'));
    }
}

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

/* Fake, in-memory database of remember me tokens */

var tokens = {};

function consumeRememberMeToken(token, fn) {
    var uid = tokens[token];
    // invalidate the single-use token
    delete tokens[token];
    return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
    tokens[token] = uid;
    return fn();
}



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            })
        });
    }
));

function issueToken(user, done) {
    var token = common.randomString(64);
    saveRememberMeToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
    });
}


router.post('/account/login',
    passport.authenticate('local', {
        failureRedirect: '/account/sign-in',
        badRequestMessage: '아이디 또는 비밀번호를 입력해주세요.',
        failureFlash: '아이디 또는 비밀번호가 정확하지 않습니다!'
    }),
    function(req, res, next) {
        winston.verbose('Log in ---- process ---- done');
        // Issue a remember me cookie if the option was checked
        if (!req.body.remember_me) { return next(); }

        issueToken(req.user, function(err, token) {
            winston.info('Issue Cookie Token', token);

            if (err) { return next(err); }
            res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
            return next();
        });
    },
    function(req, res) {
        res.redirect('/');
    }
);

module.exports = router;