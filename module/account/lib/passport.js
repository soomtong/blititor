var winston = require('winston');
var bcrypt = require('bcryptjs');
var useragent = require('useragent');

var misc = require('../../../core/lib/misc');
var common = require('../../../core/lib/common');
var counter = require('../../counter');
var account = require('./account');

var token = misc.commonToken();
var grants = misc.getUserPrivilege();

function authenticate(userID, password, done) {
/*  no need it, it checked by passport system. and that print out with `badRequestMessage` parameter
    if (!userID || !password) {
        winston.error('it needs id and password');
        return done(null, false, 'Unknown user identifier. need a id like a email type!');
    }
*/

    account.findAuthByUserID(userID, function (err, auth) {
        if (err) {
			winston.error('passport system error in ' + userID + ':' + err);

            return done(err);
        }
        if (!auth) {
            winston.warn('user given id not exactly same with authorized hash:' + userID);

            return done(null, false, {message: 'Unknown user account ' + userID});
        }

        // winston.verbose(auth, userID, password);

        bcrypt.compare(password, auth.user_password, function (err, result) {
            if (err) {
                winston.error("bcrypt system error: " + err);

                return done(err);
            }
            if (!result) {
                winston.warn('user given password not exactly same with authorized hash', result);

                return done(null, false, {message: 'Invalid password given'});
            } else {
                return done(null, auth.id); // important, passport session only has user.auth_id (or auth.id)
            }
        });
    });
}

function serialize(authID, done) {
    account.findUserByAuthID(authID, function (error, user) {
        if (error) {
            return winston.error('Error in serialize: ' + error);
		}

        winston.verbose('Serialize in process for Account auth_id='
            + authID + ',user_id=' + user.user_id + ', and user info: ' + user);

        done(error, user.uuid); // keep uuid for passport session
    });
}

function deserialize(uuid, done) {
    winston.verbose('De-Serialize in process for auth: ' + uuid);

    account.findUserByUUID(uuid, function (err, user) {
        var userGrant = [];

        if (user.grant.includes(grants.siteAdmin)) userGrant.push('시스템관리자');
        if (user.grant.includes(grants.siteManager)) userGrant.push('사이트운영자');
        if (user.grant.includes(grants.contentManager)) userGrant.push('콘텐츠담당자');

        user.grant_name = userGrant;

        done(err, user);
    });
}

function loginSuccess(req, res, next) {
    winston.info('Logged in user->uuid: ' + req.session['passport'].user);

    // insert login logging
    var authID = req.user;

    account.findUserByAuthID(authID, function (error, user) {
        account.insertLastLog(user.uuid, user.login_counter);

        var agent = useragent.parse(req.headers['user-agent']);
        counter.insertAccountCounter(user.uuid, token.account.login, agent, req.device);
    });

    // Issue a remember me cookie if the option was checked
    if (!req.body.remember_me) { return next(); }

    issueToken(req.user, function(err, token) {
        winston.info('Issue Cookie Token:' + token);

        if (err) { return next(err); }
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
        return next();
    });
}

function loginDone(req, res) {
    var q = req.session.previousURL;

    if (q !== undefined) {
        req.session.previousURL = undefined;
        return res.redirect(q.toString());
    } else {
        res.redirect('/');
    }
}

// for internal use
function issueToken(user, done) {
    var token = common.randomString(64);
    saveRememberMeToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
    });
}

function consumeRememberMeToken(token, fn) {
    var uid = tokens[token];
    // invalidate the single-use token
    delete tokens[token];
    return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
    // tokens[token] = uid;
    return fn();
}

module.exports = {
    serialize: serialize,
    deserialize: deserialize,
    authenticate: authenticate,
    loginSuccess: loginSuccess,
    loginDone: loginDone,
};