var bcrypt = require('bcrypt');
var winston = require('winston');

var misc = require('../../../core/lib/misc');
var common = require('../../../core/lib/common');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var account = require('../../account');

var userPrivilege = misc.getUserPrivilege();
var routeTable = misc.getRouteTable();

// var db = require('./database');
// var query = require('./query');

function indexPage(req, res) {
    var params = {
        title: "관리자 화면"
    };


    res.send('hi this is manager home');
}

function loginForm(req, res) {
    var params = {
        title: "관리자 화면"
    };

    res.render(BLITITOR.config.site.manageTheme + '/manage/login', params);
}

function loginProcess(req, res) {
    req.assert('id', 'Email as Manager ID field is not valid').notEmpty().withMessage('Manager ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('password').trim();

    var params = {
        managerID: req.body.id,
        password: req.body.password
    };

    account.authByUserID(params.managerID, function (err, auth) {
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

                    if (user.grant.indexOf(userPrivilege.siteManager) > -1) {
                        req.logIn(user, function (err) {
                            if (err) {
                                req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

                                winston.error(error);

                                return res.redirect('back');
                            }

                            res.redirect(routeTable.manage_root);
                        });
                    } else {
                        req.flash('error', {msg: 'You have not Manager privilege'});

                        winston.error(error);

                        return res.redirect('back');
                    }
                });
            }
        });
    });
}

module.exports = {
    index: indexPage,
    loginForm: loginForm,
    loginProcess: loginProcess
    // list: listPost,
    // write: writeForm,
    // save: savePost,
    // view: viewPost,
    // recentPost: recentPost
};