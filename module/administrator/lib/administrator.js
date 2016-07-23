var bcrypt = require('bcrypt');
var winston = require('winston');
var moment = require('moment');

var misc = require('../../../core/lib/misc');
var common = require('../../../core/lib/common');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var account = require('../../account');

var db = require('./database');

var userPrivilege = misc.getUserPrivilege();
var routeTable = misc.getRouteTable();

// var query = require('./query');
// var db = require('./database');

function indexPage(req, res) {
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
            item.created_at = !(item.created_at) ? '' : moment(item.created_at).format("YYYY-MM-DD");
            item.updated_at = !(item.updated_at) ? '' : moment(item.updated_at).format("YYYY-MM-DD");
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
    req.assert('id', 'Email as Admin ID field is not valid').notEmpty().withMessage('Admin ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('password').trim();

    var params = {
        adminID: req.body.id,
        password: req.body.password
    };

    account.authByUserID(params.adminID, function (err, auth) {
        if (err) {
            return done(err);
        }
        if (!auth) {
            return done(null, false, {message: 'Unknown user ' + userID});
        }

        // winston.verbose(auth, userID, password);

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
                account.findByID(auth.id, function (error, userData) {
                    var user = {
                        id: userData.id,
                        uuid: userData.uuid,
                        user_id: auth.user_id,
                        nickname: userData.nickname,
                        level: userData.level,
                        grant: userData.grant
                    };

                    if (user.grant.indexOf(userPrivilege.siteAdmin) > -1) {
                        req.logIn(user, function (err) {
                            if (err) {
                                req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                                winston.error(error);

                                return res.redirect('back');
                            }

                            res.redirect(routeTable.admin_root);
                        });
                    } else {
                        req.flash('error', {msg: 'You have not Admin privilege'});

                        winston.error(error);

                        return res.redirect('back');
                    }
                });
            }
        });
    });
}

function accountForm(req, res) {
    // if no account id then do register mode or view mode
    var params = {
        title: "관리자 화면",
        uuid: req.params.uuid
    };

    console.log(req.body);
    console.log(req.params);
    console.log(req.query);

    if (params.uuid) {
        res.render(BLITITOR.config.site.adminTheme + '/admin/account', params);
    } else {
        res.render(BLITITOR.config.site.adminTheme + '/admin/sign_up', params);
    }
}

function accountProcess(req, res) {


    res.send('ok');
}

module.exports = {
    index: indexPage,
    loginForm: loginForm,
    loginProcess: loginProcess,
    accountForm: accountForm,
    accountProcess: accountProcess,
};