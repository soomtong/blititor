var bcrypt = require('bcrypt');
var knex = require('knex');

var winston = require('winston');

var common = require('../../lib/common');
var connection = require('../../lib/connection');

var salt = bcrypt.genSaltSync(10);


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

function authenticate(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

        // Find the user by username.  If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure and set a flash message.  Otherwise, return the
        // authenticated `user`.
        findByUsername(username, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Unknown user ' + username});
            }
            if (user.password != password) {
                return done(null, false, {message: 'Invalid password'});
            }
            return done(null, user);
        })
    });
}

function issueToken(user, done) {
    var token = common.randomString(64);
    saveRememberMeToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
    });
}

function serialize(user, done) {
    done(null, user.id);
}

function deserialize(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
}


function loginSuccess(req, res, next) {
    winston.verbose('Log in ---- process ---- done');
    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }

    issueToken(req.user, function(err, token) {
        winston.info('Issue Cookie Token', token);

        if (err) { return next(err); }
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
        return next();
    });
}

function loginDone(req, res) {
    res.redirect('/');
}

function register(req, res) {
    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();
    req.assert('email', 'Email as User ID field is not valid').notEmpty().withMessage('User ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('password_check', 'Password Check must be same as password characters').notEmpty().withMessage('Password Check field is required').equals(req.body.password);

    req.sanitize('nickname').escape();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    var hash = bcrypt.hashSync(req.body.password, salt);

    var authData = {
        user_id: req.body.email,
        user_password: hash
    };

    // save to auth table
    var db = connection.get();

    db.insert(authData).into('auth').then(function (auth_id) {
        req.flash('info', 'Saved Account by ' + req.body.nickname, hash);

        winston.info('inserted', auth_id, 'auth id user');

        // save to user table
        var userData = {
            uuid: common.UUID(),
            auth_id: auth_id,
            nickname: req.body.nickname,
            created_at: new Date()
        };

        db.insert(userData).into('user').then(function (rows) {
            console.log(rows);

            res.redirect('/');
        }).catch(function (error) {
            req.flash('error', {msg: 'User Database operation failed'});

            winston.error(error);

            res.redirect('back');
        });

    }).catch(function (error) {
        req.flash('error', {msg: 'Auth Database operation failed'});

        winston.error(error);

        res.redirect('back');
    });








}

module.exports = {
    serialize: serialize,
    deserialize: deserialize,
    authenticate: authenticate,
    loginSuccess: loginSuccess,
    loginDone: loginDone,
    register: register
};