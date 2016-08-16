var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var winston = require('winston');
var useragent = require('useragent');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var counter = require('../../counter');

var db = require('./database');
var query = require('./query');

var token = misc.commonToken();

function findByID(id, callback) {
    var mysql = connection.get();

    db.readAccountByID(mysql, id, function (err, account) {
        if (err || !account) {
            // return Error("Can't Find by This UUID");
            return callback(err, null);
        }

        callback(null, account);
    });
}

function findByUUID(UUID, callback) {
    var mysql = connection.get();

    db.readAccountByUUID(mysql, UUID, function (err, account) {
        if (err || !account) {
            // return Error("Can't Find by This UUID");
            return callback(err, null);
        }

        callback(err, account);
    });
}

function authByUserID(userID, callback) {
    var mysql = connection.get();

    db.readAuthByUserID(mysql, userID, function (err, auth) {
        if (err || !auth) {
            // return Error("Can't Auth by This userID");
            return callback(err, null);
        }

        callback(err, auth);
    });
}

function insertLastLog(uuid, loginCounter) {
    var userData = {
        last_logged_at: new Date(),
        login_counter: loginCounter + 1
    };

    var mysql = connection.get();

    db.updateAccountByUUID(mysql, userData, uuid, function (err, result) {
        if (err) {
            winston.error(err);
            return;
        }

        winston.verbose('Updated last logged info into `user` table record:', uuid);
    });
}

function register(req, res) {
    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();
    req.assert('email', 'Email as User ID field is not valid').notEmpty().withMessage('User ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('password_check', 'Password Check must be same as password characters').notEmpty().withMessage('Password Check field is required').equals(req.body.password);
    
    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    req.sanitize('password').trim();

    // var hash = common.hash(req.body.password);
    common.hash(req.body.password, function (err, hash) {
        var authData = {
            user_id: req.body.email,
            user_password: hash
        };

        var mysql = connection.get();

        // save to auth table
        db.writeAuth(mysql, authData, function (err, result) {
            if (err) {
                req.flash('error', {msg: '계정 정보 저장에 실패했습니다.'});
                req.flash('error', {msg: err.toString()});

                winston.error(err);

                return res.redirect('back');
            }

            var auth_id = result['insertId'];

            // save to user table
            var userData = {
                uuid: common.UUID4(),
                auth_id: auth_id,
                nickname: req.body.nickname,
                level: 1,
                grant: '',
                login_counter: 0,
                last_logged_at: new Date(),
                created_at: new Date()
            };

            req.flash('info', 'Saved Account by ' + userData.nickname, '(' + authData.user_id + ')');

            db.writeAccount(mysql, userData, function (err, result) {
                if (err) {
                    req.flash('error', {msg: '사용자 정보 저장에 실패했습니다.'});

                    winston.error(error);

                    res.redirect('back');
                }

                var id = result['insertId'];

                var user = {
                    id: id,
                    uuid: userData.uuid,
                    user_id: authData.user_id,
                    nickname: userData.nickname,
                    level: userData.level,
                    grant: userData.grant
                };

                counter.insertSessionCounter(token.account.join);

                req.logIn(user, function (err) {
                    if (err) {
                        req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                        winston.error(error);

                        return res.redirect('back');
                    }

                    // insert login logging
                    insertLastLog(user.uuid, userData.login_counter);

                    var agent = useragent.parse(req.headers['user-agent']);
                    counter.insertAccountCounter(user.uuid, token.account.login, agent, req.device);

                    res.redirect('/');
                });
            });
        });
    });
}

function registerSimpleForTest(req, res) {
    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();
    req.assert('email', 'Email as User ID field is not valid').notEmpty().withMessage('User ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    req.sanitize('password').trim();

    // var hash = common.hash(req.body.password);
    common.hash(req.body.password, function (err, hash) {
        var authData = {
            user_id: req.body.email,
            user_password: hash
        };

        var mysql = connection.get();

        // save to auth table
        db.writeAuth(mysql, authData, function (err, result) {
            if (err) {
                req.flash('error', {msg: '계정 정보 저장에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            var auth_id = result['insertId'];

            // save to user table
            var userData = {
                uuid: common.UUID4(),
                auth_id: auth_id,
                nickname: req.body.nickname,
                level: 9,
                grant: 'AMC',
                login_counter: 0,
                last_logged_at: new Date(),
                created_at: new Date()
            };

            req.flash('info', 'Saved Account by ' + userData.nickname, '(' + authData.user_id + ')');

            db.writeAccount(mysql, userData, function (err, result) {
                if (err) {
                    req.flash('error', {msg: '사용자 정보 저장에 실패했습니다.'});

                    winston.error(error);

                    res.redirect('back');
                }

                var id = result['insertId'];

                var user = {
                    id: id,
                    uuid: userData.uuid,
                    user_id: authData.user_id,
                    nickname: userData.nickname,
                    level: userData.level,
                    grant: userData.grant
                };

                counter.insertSessionCounter(token.account.join);

                req.logIn(user, function (err) {
                    if (err) {
                        req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                        winston.error(error);

                        return res.redirect('back');
                    }

                    if (req.query['q'] =='admin' || req.query['q'] == 'manage') {
                        res.redirect('/' + req.query['q']);
                    } else {
                        res.redirect('/');
                    }
                });
            });
        });
    });
}

function showInfo(req, res) {
    var params = {
        title: '정보수정',
        message: req.flash()
    };

    findByUUID(req.user.uuid, function (error, userData) {
        if (error) {
            req.flash('error', {msg: '세션 정보를 찾을 수 없습니다.'});
            return res.redirect('back');
        }

        params.userInfo = userData;
        params.userInfo.created_at = moment(new Date(userData.created_at)).format('LLL');

        res.render(BLITITOR.config.site.theme + '/page/account/user_info', params);
    });
}

function updateInfo(req, res) {
    var params = {
        updatePassword: false,
        updateProfileImage: false,
    };

    var profileImage = null;

    // console.log(req.body, req.files);

    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();

    if (req.body.password/* && (req.body.password.toString().length >= 4)*/) {
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.assert('password_check', 'Password Check must be same as password characters').notEmpty().withMessage('Password Check field is required').equals(req.body.password);

        params.updatePassword = true;
        // params.password = common.hash(req.body.password);
    }
    
    var errors = req.validationErrors();

    if (errors) {
        winston.error(errors, errors.length);
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    
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

    if (req.files[0] && req.files[0].fieldname == 'profile_image') {
        params.updateProfileImage = true;

        profileImage = req.files[0];

        mkdirp('./public/upload/' + UUID, function (err) {
            if (err) winston.error('Error in Make user folder');

            // move to user folder from temp
            fs.renameSync(req.files[0].path, './public/upload/' + UUID + '/' + profileImage.filename);

            // set file info to database
            userData.photo = profileImage.filename;
        });
    }

    var mysql = connection.get();

    db.readAuthIDByUUID(mysql, UUID, function (err, account) {
        if (err) {
            req.flash('error', {msg: err});

            winston.error(err);

            return res.redirect('back');
        }

        var authID = account.auth_id;

        // update auth table, it is async routine
        if (params.updatePassword) {
            common.hash(req.body.password, function (err, hash) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

                    // if password update routine was broken
                    // then pass this process for next login
                    // it can use before password
                } else {
                    var authData = {user_password: hash};

                    db.updateAuthByID(mysql, authData, authID, function (err, result) {
                        winston.warn('Updated user password into `auth` table record:', result);
                    });
                }
            });
        }

        // update file associate table
        if (params.updateProfileImage) {
            // replace new profile photo to old one

        }

        db.updateAccountByUUID(mysql, userData, UUID, function (err, result) {
            if (err) {
                req.flash('error', {msg: err});

                winston.error(err);

                return res.redirect('back');
            }

            winston.warn('Updated user info into `user` table record:', result);

            req.flash('info', {msg: '개인 정보가 갱신되었습니다.'});

            return res.redirect('/account/info');
        });
    });
}

function signIn(req, res) {
    // sign in and grant user access level
    var prevLocation = '/';

    // res.redirect(prevLocation);

    var params = {
        title: "Home",
    };

    // res.cookie('name', 'tobi', {expires: new Date(Date.now() + 900000)});

    res.render(BLITITOR.config.site.theme + '/page/account/sign_in', params);

}

function signUp(req, res) {
    // var prevLocation = '/';
    // res.redirect(prevLocation);

    var params = {
        title: "Home",
    };

    res.render(BLITITOR.config.site.theme + '/page/account/sign_up', params);
}

function signOut(req, res) {
    counter.insertSessionCounter(token.account.logout);

    res.clearCookie('remember_me');     // clear the remember me cookie when logging out
    req.logOut();   // it aliased as req.logout()
    res.redirect('/');
    winston.info('signed out');
}

// check for available auth id or nickname, etc
function checkToken(req, res) {
    var params = {
        type: req.query('type'),
        email: req.body.email,
        nickname: req.body.nickname
    };

    var mysql = connection.get();

    switch (params.type) {
        case 'u':
            db.readAuthByUserID(mysql, params.email, function (err, auth) {
                if (err || !auth) {
                    // return Error("Can't Auth by This userID");
                    return res.send({result: true, ok: true})
                }
            });

            break;

        case 'n':
            db.readAccountByNickname(mysql, params.nickname, function (err, user) {
                if (err || !user) {
                    // return Error("Can't Auth by This userID");
                    return res.send({result: true, ok: true})
                }
            });

            break;
    }

    res.send({result: false, ok: false});
}

module.exports = {
    insertLastLog: insertLastLog,
    register: register,
    registerSimple: registerSimpleForTest,
    infoForm: showInfo,
    updateInfo: updateInfo,
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    checkToken: checkToken,
    authByUserID: authByUserID,
    findByID: findByID,
    findByUUID: findByUUID
};