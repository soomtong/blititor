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

function loginForm(req, res) {
    var params = {
        title: "운영자 화면"
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

    account.findAuthByUserID(params.managerID, function (err, auth) {
        if (err) {
            winston.verbose('something wrong in passport login system', err);

            req.flash('error', {msg: '로그인 과정에 문제가 발생했습니다.'});

            return res.redirect('back');        }
        if (!auth) {
            winston.verbose('there is no account by given auth data', err);

            req.flash('error', {msg: '등록되지 않았거나 정확하지 않은 계정입니다.'});

            return res.redirect('back');
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
                account.findUserByAuthID(auth.id, function (error, userData) {
                    var user = {
                        user_id: auth.user_id,
                        id: userData.id,
                        uuid: userData.uuid,
                        nickname: userData.nickname,
                        level: userData.level,
                        grant: userData.grant
                    };

                    if (user.grant.indexOf(userGrants.siteManager) > -1) {
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

                            res.redirect(routeTable.manage_root);
                        });
                    } else {
                        req.flash('error', {msg: 'You have not Manager privilege'});

                        winston.warn('Unauthorized user accessed');

                        return res.redirect('back');
                    }
                });
            }
        });
    });
}

function accountList(req, res) {
    var params = {
        title: "운영자 화면",
        page: Number(req.query['p']) || 1
    };

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

        res.render(BLITITOR.config.site.adminTheme + '/manage/account', params);
    });
}

function accountCounter(req, res) {
    var params = {
        title: "운영자 화면",
        month: req.query['m'] || moment().format('YYYYMM')
    };

    var mysql = connection.get();

    db.readAccountCounterByMonth(mysql, params.month, function (error, result) {
        if (error) {
            req.flash('error', {msg: '계정 목록 읽기에 실패했습니다.'});

            winston.error(error);

            res.redirect('back');
        }

        params.pagination = false;
        params.total = result.total;
        // params.hasNext = result.total > (result.page + 1) * result.pageSize;
        // params.hasPrev = result.page > 0;
        // params.maxPage = result.maxPage + 1;
        // params.page = result.page + 1;  // prevent when wrong page number assigned
        params.list = result.accountCounter;

        params.list.map(function (item) {
            item.date = common.dateFormatter(item.date, 'M월 D일');
        });

        res.render(BLITITOR.config.site.adminTheme + '/manage/account_counter', params);
    });
}

function pageLogList(req, res) {
    var params = {
        title: "운영자 화면",
        page: Number(req.query['p']) || 1
    };

    var mysql = connection.get();

    db.readVisitLogByPage(mysql, Number(params.page - 1), function (error, result) {
        if (error) {
            req.flash('error', {msg: '로그 목록 읽기에 실패했습니다.'});

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
        params.list = result.visitLogList;

        params.list.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD HH:mm');
        });

        res.render(BLITITOR.config.site.adminTheme + '/manage/page_log', params);
    });
}

function visitCounter(req, res) {
    var params = {
        title: "운영자 화면",
        today: req.query['date'] || moment().format('YYYYMMDD'),
        weekly: req.query['k'] || false
    };

    var duration = '7';
    var dates = [];
    var countOfDays = [];
    var tempDate;

    for (var idx = 0; idx <= duration; idx++) {
        tempDate = moment(params.today).subtract(idx, 'days');

        if (tempDate.date() == 1) {
            dates.push(tempDate.format('M월 D일'));
        } else {
            dates.push(tempDate.format('D 일'));
        }

        countOfDays.push(tempDate.format('YYYYMMDD'));
    }

    var mysql = connection.get();

    db.readVisitCounterByDate(mysql, countOfDays, function (error, result) {
        if (error) {
            req.flash('error', {msg: '페이지 뷰 카운터 읽기에 실패했습니다.'});

            winston.error(error);

            res.redirect('back');
        }

        params.pagination = false;
        params.dates = dates;
        params.sum = result.sum;
        params.list = result.visitCounter;

        res.render(BLITITOR.config.site.adminTheme + '/manage/index', params);
    });
}

function guestbookList(req, res) {
    var params = {
        title: "운영자 화면",
        page: Number(req.query['p']) || 1
    };

    var mysql = connection.get();

    db.readGuestbook(mysql, Number(params.page - 1), function (error, result) {
        params.pagination = true;
        params.total = result.total;
        params.pageSize = result.pageSize;
        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.maxPage = result.maxPage + 1;
        params.page = result.page + 1;  // prevent when wrong page number assigned
        params.list = result.guestbookList;

        params.list.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at);
            item.replied_at = common.dateFormatter(item.replied_at);
        });

        res.render(BLITITOR.config.site.adminTheme + '/manage/guestbook', params);
    });
}

function galleryManager(req, res) {
    var params = {
        title: "운영자 화면",
        page: Number(req.query['p']) || 1
    };

    var mysql = connection.get();

    db.readGalleryCategory(mysql, Number(params.page - 1), function (error, result) {
        params.pagination = true;
        params.total = result.total;
        params.pageSize = result.pageSize;
        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.maxPage = result.maxPage + 1;
        params.page = result.page + 1;  // prevent when wrong page number assigned
        params.categoryList = result.categoryList;

        params.categoryList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at);
        });

        res.render(BLITITOR.config.site.adminTheme + '/manage/gallery', params);
    });

}

function galleryCategory(req, res) {
    var params = {
        type: req.body.type,
        title: req.body.title || '',
        subTitle: req.body.sub_title || '',
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    switch (params.type) {
        case 'add':
            db.createGalleryCategory(mysql, params, function (error, result) {
                if (!params.xhr) return res.redirect('back');
                else return res.send({
                    "status": "success",
                    "data": {
                        "title": params.title,
                        "sub_title": params.subTitle,
                        "id": result.insertId
                    }
                });
            });

            break;

        default:
            return res.send({
                "status": "fail",
                "data": {"msg": "no title exist"}
            });
    }
}

module.exports = {
    loginForm: loginForm,
    loginProcess: loginProcess,
    pageViewLog: pageLogList,
    pageViewCounter: visitCounter,
    accountList: accountList,
    accountActionCounter: accountCounter,
    guestbookList: guestbookList,
    galleryManager: galleryManager,
    galleryCategory: galleryCategory,
};