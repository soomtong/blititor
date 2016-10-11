var fs = require('fs');
var bcrypt = require('bcryptjs');
var mkdirp = require('mkdirp');
var winston = require('winston');
var moment = require('moment');
var useragent = require('useragent');

var misc = require('../../../core/lib/misc');
var common = require('../../../core/lib/common');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var account = require('../../account');
var counter = require('../../counter');

var db = require('./database');

var userGrants = misc.getUserPrivilege();
var routeTable = misc.getRouteTable();
var token = misc.commonToken();

function accountList(req, res) {
    var params = {
        title: "관리자 화면",
        page: Number(req.query['p']) || 1,
        uuid: req.query['uuid']
    };

    // redirect to account view
    if (params.uuid) return res.redirect('account/' + params.uuid);

    var mysql = connection.get();

    db.readAccountByPage(mysql, Number(params.page - 1), function (error, result) {
        if (error) {
            req.flash('error', {msg: '계정 목록 읽기에 실패했습니다.'});

            winston.error(error);

            res.redirect('back');
        }

        params.pagination = true;
        params.total = result.total;
        params.pageSize = result.pageSize;
        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.maxPage = result.maxPage + 1;
        params.page = result.page + 1;  // prevent when wrong page number assigned
        params.list = result.accountList;

        params.list.map(function (item) {
            item.last_logged_at = !(item.last_logged_at) ? '' : moment(item.last_logged_at).fromNow();
            item.created_at = common.dateFormatter(item.created_at);
            item.updated_at = common.dateFormatter(item.updated_at);
        });

        res.render(BLITITOR.config.site.adminTheme + '/admin/index', params);
    });
}

function loginForm(req, res) {
    var params = {
        title: "관리자 화면"
    };

    res.render(BLITITOR.config.site.adminTheme + '/admin/login', params);
}

function loginProcess(req, res) {
    req.assert('account_id', 'Email as Admin ID field is not valid').notEmpty().withMessage('Admin ID is required').isEmail();
    req.assert('account_password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('password').trim();

    var params = {
        adminID: req.body.account_id,
        password: req.body.account_password
    };

    account.findAuthByUserID(params.adminID, function (err, auth) {
        if (err) {
            winston.verbose('something wrong in passport login system', err);

            req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

            return res.redirect('back');
        }
        if (!auth) {
            winston.verbose('there is no account by given auth data', err);

            req.flash('error', {msg: '등록되지 않았거나 정확하지 않은 계정입니다.'});

            return res.redirect('back');
        }

        bcrypt.compare(params.password, auth.user_password, function (err, result) {
            if (err) {
                winston.error("bcrypt system error", err);

                return res.redirect('back');
            }
            if (!result) {
                winston.verbose('user given password not exactly same with authorized hash', result);

                req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                return res.redirect('back');
            } else {
                // retrieve with auth
                account.findUserByAuthID(auth.id, function (error, userData) {
                    var user = {
                        user_id: auth.user_id,
                        id: userData.id,
                        uuid: userData.uuid,
                        nickname: userData.nickname,
                        level: userData.level,
                        grant: userData.grant
                    };

                    if (user.grant.includes(userGrants.siteAdmin)) {
                        req.logIn(auth.id, function (err) {
                            if (err) {
                                req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                                winston.error(err);

                                return res.redirect('back');
                            }

                            // insert login logging
                            account.insertLastLog(user.uuid, userData.login_counter || 0);

                            var agent = useragent.parse(req.headers['user-agent']);
                            counter.insertAccountCounter(user.uuid, token.account.login, agent, req.device);

                            res.redirect(routeTable.admin_root);
                        });
                    } else {
                        req.flash('error', {msg: 'You have not Admin privilege'});

                        winston.warn('Unauthorized user accessed');

                        return res.redirect('back');
                    }
                });
            }
        });
    });
}

function accountView(req, res) {
    // if no account id then do register mode or view mode
    var params = {
        title: "관리자 화면",
        uuid: req.params.uuid
    };

    if (params.uuid) {
        var mysql = connection.get();

        db.readAccount(mysql, params.uuid, function (error, result) {
            if (error) {
                req.flash('error', {msg: '계정 목록 읽기에 실패했습니다.'});

                winston.error(error);

                res.redirect('back');
            }

            db.readAccountLog(mysql, params.uuid, function (error, rows) {
                if (error) {
                    req.flash('error', {msg: '로그 목록 읽기에 실패했습니다.'});

                    winston.error(error);

                    res.redirect('back');
                }

                rows.map(function (item) {
                    item.created_at = common.dateFormatter(item.created_at, "YYYY-MM-DD HH:mm");
                });

                params.account = result;
                params.accountLog = rows;

                params.account.created_at = common.dateFormatter(result.created_at);
                params.account.updated_at = common.dateFormatter(result.updated_at);

                res.render(BLITITOR.config.site.adminTheme + '/admin/account', params);
            });
        });
    } else {
        res.render(BLITITOR.config.site.adminTheme + '/admin/sign_up', params);
    }
}

function accountForm(req, res) {
    // if no account id then do register mode or view mode
    var params = {
        title: "관리자 화면",
        uuid: req.params.uuid
    };

    if (!params.uuid) {
        req.flash('error', {msg: '계정 목록 읽기에 실패했습니다.'});

        winston.error(error);

        res.redirect('back');
    } else {
        var mysql = connection.get();

        db.readAccount(mysql, params.uuid, function (error, result) {
            if (error) {
                req.flash('error', {msg: '계정 목록 읽기에 실패했습니다.'});

                winston.error(error);

                res.redirect('back');
            }

            params.account = result;

            params.account.created_at = common.dateFormatter(result.created_at);
            params.account.updated_at = common.dateFormatter(result.updated_at);
            params.account.grant_admin = result.grant.includes('A');
            params.account.grant_manager = result.grant.includes('M');
            params.account.grant_content = result.grant.includes('C');

            res.render(BLITITOR.config.site.adminTheme + '/admin/account_form', params);
        });
    }
}

function accountProcess(req, res) {
    var params = {
        updatePassword: false,
        updateProfileImage: false,
    };

    var profileImage = null;

    console.log(req.params.uuid, req.body, req.files);

    req.assert('uuid', 'uuid is required').notEmpty();
    req.assert('nickname', 'screen name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();

    if (req.body.account_password/* && (req.body.password.toString().length >= 4)*/) {
        req.assert('account_password', 'Password must be at least 4 characters long').len(4);

        params.updatePassword = true;
    }

    var errors = req.validationErrors();

    if (errors) {
        winston.error(errors, errors.length);
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    req.sanitize('desc').escape();
    req.sanitize('point').escape();

    var UUID = req.params.uuid;

    if (!UUID) {
        req.flash('error', {msg: 'No Session Info Exist!'});

        return res.redirect('back');
    }

    var userData = {
        nickname: req.body.nickname,
        level: req.body.level,
        grant: String(req.body.grant_checker_admin || '').toUpperCase().trim() +
               String(req.body.grant_checker_manager || '').toUpperCase().trim() +
               String(req.body.grant_checker_content || '').toUpperCase().trim(),
        desc: req.body.desc,
        point: Number(req.body.point),
        created_at: new Date(req.body.created_at),
        updated_at: new Date(req.body.updated_at)
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
            common.hash(req.body.account_password, function (err, hash) {
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

            return res.redirect(routeTable.admin_root + routeTable.admin.account + '/' + UUID);
        });
    });
}

module.exports = {
    loginForm: loginForm,
    loginProcess: loginProcess,
    accountList: accountList,
    accountView: accountView,
    accountForm: accountForm,
    accountProcess: accountProcess,
};