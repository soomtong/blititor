var bcrypt = require('bcrypt');
var knex = require('knex');

var winston = require('winston');

var common = require('../../lib/common');
var connection = require('../../lib/connection');

var salt = bcrypt.genSaltSync(10);

function findByID(id, callback) {
    var mysql = connection.get();

    mysql('user').where({id: id}).select('id', 'uuid', 'nickname', 'photo', 'level', 'grant').then(function (results) {
        callback(null, results[0]);
    }).catch(function (error) {
        callback(error);
    });
}

function findByUUID(uuid, callback) {
    var mysql = connection.get();

    mysql('user').where({uuid: uuid}).select('id', 'uuid', 'nickname', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at').then(function (results) {
        callback(null, results[0]);
    }).catch(function (error) {
        callback(error);
    });
}

function authByUserID(userID, callback) {
    var mysql = connection.get();

    mysql('auth').where({user_id: userID}).select('id', 'user_id', 'user_password').then(function (results) {
        callback(null, results[0]);
    }).catch(function (error) {
        callback(error);
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

function authenticate(userID, password, done) {
    var hash = bcrypt.hashSync(password, salt);

    authByUserID(userID, function (err, auth) {
        if (err) {
            return done(err);
        }
        if (!auth) {
            return done(null, false, {message: 'Unknown user ' + userID});
        }

        if (bcrypt.compareSync(auth.user_password,hash)) {
            winston.verbose('user given password not exactly same with authorized hash');

            return done(null, false, {message: 'Invalid password'});
        }

        return done(null, auth);
    })
}

function issueToken(user, done) {
    var token = common.randomString(64);
    saveRememberMeToken(token, user.id, function(err) {
        if (err) { return done(err); }
        return done(null, token);
    });
}

function serialize(user, done) {
    winston.verbose('Serialize in ---- process ---- for', user);

    findByID(user.id, function (error, user) {
        done(error, user.uuid);
    });
}

function deserialize(uuid, done) {
    winston.verbose('DeSerialize in ---- process ---- for', uuid);

    findByUUID(uuid, function (err, user) {
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

    var mysql = connection.get();

    // save to auth table
    mysql('auth').insert(authData).then(function (authResults) {
        var auth_id = Array.isArray(authResults) ? authResults.pop() : authResults;
        winston.info('inserted', auth_id, 'auth id user');

        // save to user table
        var userData = {
            uuid: common.UUID(),
            auth_id: auth_id,
            nickname: req.body.nickname,
            level: 1,
            grant: '',
            login_counter: 1,
            last_logged_at: new Date(),
            created_at: new Date()
        };

        req.flash('info', 'Saved Account by ' + userData.nickname, '(' + authData.user_id + ')');

        mysql('user').insert(userData).then(function (userResults) {

            var user = {
                uuid: userData.uuid,
                user_id: authData.user_id,
                nickname: userData.nickname,
                level: userData.level,
                grant: userData.grant
            };

            req.logIn(user, function (err) {
                if (err) {
                    req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                    winston.error(error);

                    return res.redirect('back');
                }

                res.redirect('/');
            });
        }).catch(function (error) {
            req.flash('error', {msg: '사용자 정보 저장에 실패했습니다.'});

            winston.error(error);

            res.redirect('back');
        });

    }).catch(function (error) {
        req.flash('error', {msg: '계정 정보 저장에 실패했습니다.'});

        winston.error(error);

        res.redirect('back');
    });

}

function showInfo(req, res) {
    var params = {
        user: req.user,
        message: req.flash()
    };

    findByUUID(req.user.uuid, function (error, user) {
        if (error) {
            req.flash('error', {msg: '세션 정보를 찾을 수 없습니다.'});
            return res.redirect('back');
        }

        params.userInfo = user;

        res.render(BLITITOR.config.site.theme + '/page/account/info', params);
    });
}

function updateInfo(req, res) {
    var params = {
        user: req.user,
        message: req.flash(),
        updatePassword: false
    };

    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();

    if (req.body.password && (req.body.password.toString().length >= 4)) {
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('password_check', 'Password Check must be same as password characters').notEmpty().withMessage('Password Check field is required').equals(req.body.password);

        params.updatePassword = true;
        params.password = bcrypt.hashSync(req.body.password, salt);
    }

    req.sanitize('nickname').escape();

    var errors = req.validationErrors();

    if (errors) {
        winston.error(errors, errors.length);
        req.flash('error', errors);
        return res.redirect('back');
    }

    var UUID = req.user.uuid;

    if (!UUID) {
        req.flash('error', {msg: 'No Session Info Exist!'});

        return res.redirect('back');
    }

    var userData = {
        nickname: req.body.nickname,
        level: 2,
        grant: 'M',
        updated_at: new Date()
    };

    var mysql = connection.get();

    mysql('user').where({uuid: UUID}).select('auth_id').then(function (authResult1) {

        var authID = authResult1[0].auth_id;

        if (params.updatePassword) {
            // update auth table
            mysql('auth').where({id: authID}).update({user_password: params.password}).then(function (authResult2) {
                winston.warn('Updated user password into `auth` table record:', authResult2);
            });
        }

        // update user table
        mysql('user').where({uuid: UUID}).update(userData).then(function (userResult) {
            winston.warn('Updated user info into `user` table record:', userResult);

            req.flash('info', {msg: '개인 정보가 갱신되었습니다.'});

            return res.redirect('/account/info');
        });
    }).catch(function (error) {
        winston.error(error);
        req.flash('error', {msg: error});

        return res.redirect('back');
    });
}

module.exports = {
    serialize: serialize,
    deserialize: deserialize,
    authenticate: authenticate,
    loginSuccess: loginSuccess,
    loginDone: loginDone,
    register: register,
    infoForm: showInfo,
    updateInfo: updateInfo,
};