var fs = require('fs');
var path = require('path');
var async = require('neo-async');
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
    req.assert('account_id', 'Email as Manager ID field is not valid').notEmpty().withMessage('Manager ID is required').isEmail();
    req.assert('account_password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);
        return res.redirect('back');
    }

    req.sanitize('account_password').trim();

    var params = {
        managerID: req.body.account_id,
        password: req.body.account_password
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

                    if (user.grant.includes(userGrants.siteManager)) {
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

function index(req, res) {
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

        params.pagination = result.pagination;
        params.totalVisitLogCount = result.total;
        params.visitLogList = result.visitLogList;

        params.visitLogList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD HH:mm');
        });

        res.render(BLITITOR.config.site.manageTheme + '/manage/index', params);
    });
}

function dashboard(req, res) {
    var params = {
        title: "운영자 화면",
        today: req.query['date'] || moment().format('YYYYMMDD'),
        weekly: req.query['k'] || false,
        list: []
    };

    var duration = '7';
    var dates = [];
    var countOfDays = [];
    var tempDate;

    for (var idx = 0; idx < duration; idx++) {
        tempDate = moment(params.today).subtract(idx, 'days');

        if (tempDate.date() === 1) {
            dates.push(tempDate.format('M월 D일'));
        } else {
            dates.push(tempDate.format('D 일'));
        }

        countOfDays.push(tempDate.format('YYYYMMDD'));
    }

    params.dates = dates;

    var mysql = connection.get();

    var tasks = [
        function (done) {
            db.readAccountCounterByDate(mysql, countOfDays, function (error, result) {
                if (error) {
                    req.flash('error', {msg: '방문자 카운터 읽기에 실패했습니다.'});

                    winston.error(error);

                    res.redirect('back');
                }

                var sessions = [];
                var logins = [];

                var tempObj = {};

                result.accountCounter.map(function (item) {
                    tempObj[item.date] = {
                        session: item['session_init'],
                        login: item['sign_in']
                    }
                });

                countOfDays.map(function (item) {
                    sessions.push(tempObj[item].session || 0);
                    logins.push(tempObj[item].login || 0);
                });

                done(null, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: "방문",
                            backgroundColor: 'rgba(236, 104, 46, 0.5)',
                            borderColor: 'rgba(236, 104, 46, 0.5)',
                            borderWidth: 3,

                            //point options
                            pointBorderColor: "transparent",
                            pointBackgroundColor: "rgba(236, 104, 46, 1)",
                            pointBorderWidth: 0,
                            tension: '0',

                            data: sessions,
                            fill: false
                        }, {
                            label: "로그인",
                            backgroundColor: 'rgba(111, 211, 227, 0.6)',
                            borderColor: 'rgba(91, 173, 186, 0.5)',
                            borderWidth: 3,

                            //point options
                            pointBorderColor: "transparent",
                            pointBackgroundColor: "rgba(111, 211, 227, 1)",
                            pointBorderWidth: 0,
                            tension: '0',

                            data: logins,
                            fill: false
                        }]
                    },
                    options: {
                        chartArea: {
                            backgroundColor: 'rgba(100, 100, 100, 0.02)'
                        }
                    }
                });
            });
        },
        function (done) {
            db.readPageCounterByDate(mysql, countOfDays, function (error, result) {
                if (error) {
                    req.flash('error', {msg: '페이지 뷰 카운터 읽기에 실패했습니다.'});

                    winston.error(error);

                    res.redirect('back');
                }

                done(null, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: "페이지뷰",
                            backgroundColor: 'rgba(77, 177, 158, 0.5)',
                            borderColor: 'rgba(77, 177, 158, 0.5)',
                            borderWidth: '0',

                            //point options
                            pointBorderColor: "transparent",
                            pointBackgroundColor: "rgba(77, 177, 158, 1)",
                            pointBorderWidth: 0,
                            tension: '0',
                            data: [
                                result.visitCounter['T0'],
                                result.visitCounter['T1'],
                                result.visitCounter['T2'],
                                result.visitCounter['T3'],
                                result.visitCounter['T4'],
                                result.visitCounter['T5'],
                                result.visitCounter['T6']
                            ],
                            fill: true
                        }]
                    },
                    options: {
                        chartArea: {
                            backgroundColor: 'rgba(100, 100, 100, 0.02)'
                        }
                    }
                });
            });
        }];

    async.parallel(tasks, function(err, result) {
        params.accountGraph = result[0];
        params.pageviewGraph = result[1];

        res.send(params)
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

        res.render(BLITITOR.config.site.manageTheme + '/manage/account', params);
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

        res.render(BLITITOR.config.site.manageTheme + '/manage/account_counter', params);
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

        res.render(BLITITOR.config.site.manageTheme + '/manage/page_log', params);
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

        res.render(BLITITOR.config.site.manageTheme + '/manage/index', params);
    });
}

function guestbookList(req, res) {
    var params = {
        title: "운영자 화면",
        page: Number(req.query['p']) || 1,
        flag: req.query['flag']
    };

    var mysql = connection.get();

    if (params.flag === 'noreply') {
        db.readGuestbookWithoutReply(mysql, Number(params.page - 1), function (error, result) {
            params.pagination = true;
            params.totalCount = result.total || 0;
            params.pageSize = result.pageSize;
            params.hasNext = result.total > (result.page + 1) * result.pageSize;
            params.hasPrev = result.page > 0;
            params.maxPage = result.maxPage + 1;
            params.page = result.page + 1;  // prevent when wrong page number assigned
            params.list = result.guestbookList;

            params.list.map(function (item) {
                item.created_at = common.dateFormatter(item.created_at);
            });

            res.render(BLITITOR.config.site.manageTheme + '/manage/guestbook_reply', params);
        });
    } else {
        db.readGuestbook(mysql, Number(params.page - 1), function (error, result) {
            params.pagination = result.pagination;
            params.totalCount = result.total || 0;
            params.list = result.guestbookList;
            params.notRepliedCount = 0;

            params.list.map(function (item) {
                item.created_at = common.dateFormatter(item.created_at);
                item.replied_at = common.dateFormatter(item.replied_at);

                if (!item.reply) {
                    params.notRepliedCount += 1;
                }
            });

            res.render(BLITITOR.config.site.manageTheme + '/manage/guestbook', params);
        });
    }
}

function guestbookReply(req, res) {
    req.assert('guestbook_id', 'id as message ID field is not valid').notEmpty().withMessage('Message ID is required');
    req.assert('reply', 'reply message is required').len(2).withMessage('Must be 2 chars over').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('guestbook_id').escape();
    req.sanitize('reply').escape();

    var replyData = {
        reply: req.body.reply,
        replied_at: new Date()
    };

    var mysql = connection.get();

    db.writeGuestbookReply(mysql, req.body.guestbook_id, replyData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        req.flash('info', 'Saved Reply by ' + (req.user.nickname || req.user.email));

        res.redirect(routeTable.manage_root + routeTable.guestbook_root + '?flag=noreply');
    });
}

function guestbookDelete(req, res) {
    req.assert('guestbook_id', 'id as message ID field is not valid').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('guestbook_id').escape();

    var mysql = connection.get();

    db.deleteGuestbook(mysql, req.body.guestbook_id, function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 삭제에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        winston.info('Deleted guestbook id', req.body.guestbook_id);

        req.flash('info', 'Deleted Guestbook id ' + req.body.guestbook_id);

        res.send({status: "success", data: result})
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

        res.render(BLITITOR.config.site.manageTheme + '/manage/gallery', params);
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

function galleryImageList(req, res) {
    var params = {
        category: req.body.cate,
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readGalleryImageList(mysql, params, function (error, result) {
        return res.send(result);
    });
}

function galleryImageSort(req, res) {
    var params = {
        category: req.body.category,
        sortArray: req.body.sort
    };

    var mysql = connection.get();

    var iterator = function (item, idx, done) {
        params.sort = idx + 1;
        params.id = item;

        db.updateGalleryImage(mysql, params, function (error, result) {
            // console.log(error, result);
            done(error, params.id)
        });
    };

    var result = function (error, result) {
        res.send({
            "status": "success",
            "data": {
                "category": params.category,
                "result": result
            }
        });
    };

    async.mapSeries(params.sortArray, iterator, result);
}

function galleryImageDelete(req, res) {
    var params = {
        file: req.body.file
    };

    var folder = {
        temp: 'public/upload/temp/',
        thumb: 'public/upload/gallery/thumb/',
        image: 'public/upload/gallery/image/'
    };

    console.log(params.file);
    // remove file
    fs.unlink(path.join(folder.temp, params.file.filename), function (err) {
        winston.info('removed uploaded file in temp', folder.temp, params.file.filename);
    });
    fs.unlink(path.join(folder.thumb, params.file.filename), function (err) {
        winston.info('removed uploaded file in temp', folder.thumb, params.file.filename);
    });
    fs.unlink(path.join(folder.image, params.file.filename), function (err) {
        winston.info('removed uploaded file in temp', folder.image, params.file.filename);
    });

    res.send({
        "status": "success",
        "data": {
            "filename": params.file.filename
        }
    });
}

function reservationList(req, res) {
    var params = {
        title: "운영자 화면",
        cate: Number(req.query['c']) || 1,
        page: Number(req.query['p']) || 1
    };

    var mysql = connection.get();

    db.readReservationList(mysql, Number(params.page - 1), Number(params.cate), function (error, result) {
        params.pagination = true;
        params.total = result.total;
        params.pageSize = result.pageSize;
        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.maxPage = result.maxPage + 1;
        params.page = result.page + 1;  // prevent when wrong page number assigned
        params.reservationList = result.reservationList;

        params.reservationList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD');
            item.updated_at = common.dateFormatter(item.updated_at, 'DD, HH:m');
        });

        res.render(BLITITOR.config.site.manageTheme + '/manage/reservation', params);
    });
}

function reservationListFull(req, res) {
    var params = {
        title: "운영자 화면",
        cate: Number(req.query['c']) || 1
    };

    var mysql = connection.get();

    db.readReservationListFull(mysql, Number(params.cate), function (error, result) {
        params.pagination = false;
        params.total = result.total;
        params.reservationList = result.reservationList;

        params.reservationList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD');
            item.updated_at = common.dateFormatter(item.updated_at, 'MM-DD HH:m');
        });

        res.render(BLITITOR.config.site.manageTheme + '/manage/reservation_download', params);
    });
}

function reservationStatus(req, res) {
    var params = {
        title: "운영자 화면",
        cate: Number(req.query['c']) || 1
    };

    var mysql = connection.get();

    db.readReservationStatus(mysql, Number(params.cate), function (error, rows) {
        params.reservationStatus = rows;

/*
        params.reservationStatus.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at);
        });
*/

        // console.log(params);
        res.render(BLITITOR.config.site.manageTheme + '/manage/reservation_status', params);
    });
}

function reservationTutorialStatus(req, res) {
    var params = {
        status_id: req.body.id || req.query.id,
        category: req.body.cate || 1,
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readTutorialStatus(mysql, params, function (error, result) {
        params.reservationList = result;

        params.reservationList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD');
            item.updated_at = common.dateFormatter(item.updated_at, 'DD, HH:mm');
        });

        res.render(BLITITOR.config.site.manageTheme + '/manage/partial/reservation_status_list', params);
    });
}

module.exports = {
    loginForm: loginForm,
    loginProcess: loginProcess,
    index: index,
    dashboard: dashboard,
    pageViewLog: pageLogList,
    pageViewCounter: visitCounter,
    accountList: accountList,
    accountActionCounter: accountCounter,
    guestbookList: guestbookList,
    guestbookReply: guestbookReply,
    guestbookDelete: guestbookDelete,
    galleryImageList: galleryImageList,
    galleryManager: galleryManager,
    galleryCategory: galleryCategory,
    galleryImageSort: galleryImageSort,
    galleryImageDelete: galleryImageDelete,
    reservationList: reservationList,
    reservationListFull: reservationListFull,
    reservationStatus: reservationStatus,
    reservationTutorialStatus: reservationTutorialStatus,
};