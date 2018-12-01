const fs = require('fs');
const util = require('util');
const path = require('path');
const async = require('neo-async');
const winston = require('winston');
const request = require('request');

const slack = require('../../slack');
const mailgun = require('../../mailgun');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const connection = require('../../../core/lib/connection');

const db = require('./database');

const categoryList = ['', 'summer', 'fall', 'tutorial'];

function reservationForm(req, res) {
    const params = {
        category: req.params['cate'] || req.query['cate']
    };

    const categoryID = categoryIndex(params.category);

    const mysql = connection.get();

    db.readReservationStatus(mysql, categoryID, function (error, results) {
        params.status = results;
        params.closedTutorial = true;

        const tutorialCount = results.length;

        for (let i = 0; i < tutorialCount; i++) {
            if (results[i].counter < results[i].max_count) {
                params.closedTutorial = false;

                winston.verbose('Tutorial Section is not closed');

                break;
            }
        }

        if (params.category) {
            return res.render(BLITITOR.site.theme + `/page/reservation/${params.category}/form`, params);
        } else {
            return res.render(BLITITOR.site.theme + '/page/reservation/form', params);
        }
    });
}

function createReservation(req, res) {
    const reservedSession = req.session['reservation'] || {};

    req.assert('register_name', 'Name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();
    req.assert('register_email', 'Email is required').notEmpty().withMessage('Email ID should be email type string').isEmail();
    req.assert('register_phone', 'Phone number is required').notEmpty();
    // req.assert('register_phone_secret', '휴대폰 인증정보가 일치하지 않습니다.').equals(reservedSession.secretNumber);

    const errors = req.validationErrors();

    if (errors) {
        winston.error('phone number with secret number');
        winston.error(reservedSession.phone);
        // winston.error(reservedSession.secretNumber);
        winston.warn(util.inspect(errors));
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('register_name').escape();
    req.sanitize('register_email').trim();
    req.sanitize('register_phone').trim();

    // remove dash in phone field
    const reservationData = {
        category: categoryIndex(req.body.category),
        name: req.body.register_name,
        email: req.body.register_email,
        phone: req.body.register_phone.replace(/-/g, '')
    };

    // custom data for status
    const sectionStatusData = [];

    if (req.body.track_choice1) sectionStatusData.push(req.body.track_choice1);
    if (req.body.track_choice2_1) sectionStatusData.push(req.body.track_choice2_1);
    if (req.body.track_choice2_2) sectionStatusData.push(req.body.track_choice2_2);
    if (req.body.track_choice2_3) sectionStatusData.push(req.body.track_choice2_3);
    if (req.body.track_choice3_1) sectionStatusData.push(req.body.track_choice3_1);
    if (req.body.track_choice3_2) sectionStatusData.push(req.body.track_choice3_2);
    if (req.body.track_choice3_3) sectionStatusData.push(req.body.track_choice3_3);
    if (req.body.track_choice4_1) sectionStatusData.push(req.body.track_choice4_1);
    if (req.body.track_choice4_2) sectionStatusData.push(req.body.track_choice4_2);
    if (req.body.track_choice4_3) sectionStatusData.push(req.body.track_choice4_3);
    if (req.body.track_choice5_1) sectionStatusData.push(req.body.track_choice5_1);
    if (req.body.track_choice5_2) sectionStatusData.push(req.body.track_choice5_2);
    if (req.body.track_choice5_3) sectionStatusData.push(req.body.track_choice5_3);
    if (req.body.track_choice6_1) sectionStatusData.push(req.body.track_choice6_1);
    if (req.body.track_choice6_2) sectionStatusData.push(req.body.track_choice6_2);
    if (req.body.register_introduce) sectionStatusData.push(req.body.register_introduce);
    if (req.body.register_motive) sectionStatusData.push(req.body.register_motive);
    if (req.body.register_invited) sectionStatusData.push(req.body.register_invited);
    if (req.body.register_birthday) sectionStatusData.push(req.body.register_birthday);

    if (req.body.register_apply_tutorial1) sectionStatusData.push(req.body.register_apply_tutorial1);
    if (req.body.register_apply_tutorial2) sectionStatusData.push(req.body.register_apply_tutorial2);
    if (req.body.register_apply_tutorial3) sectionStatusData.push(req.body.register_apply_tutorial3);

    // console.log(reservationData, sectionStatusData);

    let params = {};

    findReservationByGiven(reservationData, function (error, reservation) {

        const slackChannel = "C2SM667BP";

        const mysql = connection.get();

        if (reservation) {
            // go update
            params = {
                id: reservation.id,
                reservationData: {
                    info: req.body.register_info,
                    updated_at: new Date(),
                    status: sectionStatusData.join(' | ')
                },
                prevReservationStatus: reservation.status
            };

            updateReservationStatus(params.reservationData.status, params.prevReservationStatus);

            db.updateReservation(mysql, params, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error('Reservation Status Update Error: ' + err);

                    return res.redirect('back');
                }

                winston.warn('Updated reservation Count:', result.changedRows);

                params.name = reservationData.name;
                params.mode = '갱신 완료';
                params.message = params.name + '(' + reservationData.phone + ') 님의 사전 예약이 ' + params.mode + '되었습니다.';

                // send notifications
                slack.sendMessage(params.message, slackChannel);
                mailgun.sendKossconMail({
                    email: reservationData.email,
                    name: params.name,
                    mode: params.mode
                });

                if (sectionStatusData.length) {
                    getReservationStatusByID(sectionStatusData, function (error, rows) {
                        params.sectionList = rows;

                        if (req.body.category) {
                            return res.render(BLITITOR.site.theme + `/page/reservation/${req.body.category}/done`, params);
                        } else {
                            return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                        }
                    });
                } else {
                    if (req.body.category) {
                        return res.render(BLITITOR.site.theme + `/page/reservation/${req.body.category}/done`, params);
                    } else {
                        return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                    }
                }
            });
        } else {
            // go insert
            reservationData.info = req.body.register_info;
            reservationData.status = sectionStatusData.join(' | ');
            reservationData.created_at = new Date();
            reservationData.updated_at = new Date();

            updateReservationStatus(reservationData.status);

            db.createReservation(mysql, reservationData, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

                    return res.redirect('back');
                }

                winston.warn('Inserted reservation ID:', result);

                params.name = reservationData.name;
                params.mode = '입력 완료';
                params.message = params.name + '(' + reservationData.phone + ') 님의 사전 예약이 ' + params.mode + '되었습니다.';

                // send notifications
                slack.sendMessage(params.message, slackChannel);
                mailgun.sendKossconMail({
                    email: reservationData.email,
                    name: params.name,
                    mode: params.mode
                });

                if (sectionStatusData.length) {
                    getReservationStatusByID(sectionStatusData, function (error, rows) {
                        params.sectionList = rows;

                        if (req.body.category) {
                            return res.render(BLITITOR.site.theme + `/page/reservation/${req.body.category}/done`, params);
                        } else {
                            return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                        }
                    });
                } else {
                    if (req.body.category) {
                        return res.render(BLITITOR.site.theme + `/page/reservation/${req.body.category}/done`, params);
                    } else {
                        return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                    }
                }
            });
        }
    });
}

function reservationList(req, res) {
    const params = {
        category: req.params['cate'] || req.query['cate'],
        xhr: req.xhr || false
    };

    const mysql = connection.get();

    db.readReservationList(mysql, params, function (error, result) {
        return res.send(result);
    });
}

function reservationStatusList(req, res) {
    const params = {
        category: req.params['cate'] || req.query['cate'],
        xhr: req.xhr || false
    };

    const mysql = connection.get();

    db.readReservationStatus(mysql, params.category, function (error, result) {
        params.cateList = result || [];

        res.render(BLITITOR.site.theme + '/page/reservation/status_list', params);
    });
}

function generateSecret(req, res) {
    const params = {
        phone: req.body.phone.replace(/-/g, ''),
        secretNumber: common.randomNumber(4)
    };

    winston.info('Generated phone secret number:' + util.inspect(params));

    req.session.reservation = params;

    if (BLITITOR.env !== 'production') {
        winston.warn('pass by sms sending, because it\'s a development mode');
        return res.send({
            "status": "success",
            "data": {
                "phone": params.phone
            }
        });
    }

    // post request to phone message service
    const smsToken = misc.serviceToken('sms_api');
    const smsProvider = misc.serviceProvider('sms_api');
    const sender = '01045151082';

    request({
        uri: smsProvider,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-waple-authorization': smsToken
        },
        encoding: 'utf8',
        json: true,
        formData: {
            dest_phone: params.phone,
            send_phone: sender,
            send_name: "코스콘 관리자",
            msg_body: "[KOSSCON][" + params.secretNumber + "] 사전등록 신청 인증번호는 " + params.secretNumber + " 입니다"
        }
    }, function (error, response, body) {
        winston.info('sent sms secret message by ' + smsProvider);

        if (response.statusCode == 200 && body['result_message'] == 'OK') {
            res.send({
                "status": "success",
                "data": {
                    "phone": params.phone
                }
            });
        } else {
            winston.error('failed sent sms to ' + params.phone);

            res.send({
                "status": "fail",
                "data": {
                    "phone": params.phone
                }
            });
        }
    });
}

function findReservationByGiven(reservationData, callback) {
    const mysql = connection.get();

    db.readReservationByReservationData(mysql, reservationData, function (err, result) {
        if (err || !result) {
            // winston.warn("Can't Find by This reservationData, Go insert New Reservation Data", err, result);

            callback(err, null);
        } else {
            // winston.warn("Found by This reservationData, Go update Reservation Data", err, result);

            callback(err, result);
        }
    });
}

function getReservationStatusByID(sectionData, callback) {
    const mysql = connection.get();

    db.readReservationStatusByID(mysql, sectionData, function (err, rows) {
        callback(err, rows);
    });
}

function updateReservationStatus(status, prevStatus) {
    const mysql = connection.get();

    // decrease
    if (prevStatus) {
        prevStatus = prevStatus.split(' | '); // in fact it's bad habit, i know. will go into details next time.

        prevStatus.map(function (item) {
            db.decreaseReservationStatus(mysql, item, function (error, result) {
                winston.info('decreased status', item);
            });
        });
    }

    // increase
    if (status) {
        status = status.split(' | '); // in fact it's bad habit, i know. will go into details next time.

        status.map(function (item) {
            db.increaseReservationStatus(mysql, item, function (error, result) {
                winston.info('decreased status', item);
            });
        });
    }
}

function reservationManageHome(req, res) {
    const params = {
        title: "운영자 화면",
        cate: Number(req.query['c']) || 2,
        page: Number(req.query['p']) || 1
    };

    const mysql = connection.get();

    db.readReservationList(mysql, Number(params.page), Number(params.cate), function (error, result) {
        params.pagination = result.pagination;
        params.totalCount = result.total || 0;
        params.reservationList = result.reservationList;

        params.reservationList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD');
            item.updated_at = common.dateFormatter(item.updated_at, 'DD, HH:m');
            item.statusList = item.status.split(/\||,/).map(sess => sess.trim()).filter(title => !!title);
        });

        res.render(BLITITOR.site.manageTheme + '/manage/reservation', params);
    });
}

function reservationManage(req, res) {

}

function reservationListFull(req, res) {
    const params = {
        title: "운영자 화면",
        cate: Number(req.query['c']) || 2
    };

    // it should be go to database records
    const sessionTitle = [
        '[Opening] Keynote',
        '[Track1] AI Development',
        '[Track1] AI Industry',
        '[Track1] AI Community',
        '[Track2] BigData Development',
        '[Track2] BigData Industry',
        '[Track2] BigData Community',
        '[Track3] BlockChain Development',
        '[Track3] BlockChain Industry',
        '[Track3] BlockChain Community',
        '[Track4] Cloud Development',
        '[Track4] Cloud Industry',
        '[Track4] Cloud Community',
        '[Track1] A.I Development',
        '[Track1] A.I Industry',
        '[Track1] A.I Community',
    ];
    const tutorialTitle = [
        '튜토리얼1',
        '튜토리얼2',
        '기타정보',
    ];

    const mysql = connection.get();

    db.readReservationListFull(mysql, Number(params.cate), function (error, result) {
        params.pagination = false;
        params.total = result.total;
        params.reservationList = result.reservationList;

        if (params.cate == 2) {
            params.statusMap = sessionTitle.slice(0, 12);    // only need 0~12 to show in a view
        } else {
            params.statusMap = tutorialTitle.slice(0, 3);    // only need 0~12 to show in a view
        }

        params.reservationList.map(function (item) {
            item.created_at = common.dateFormatter(item.created_at, 'MM-DD');
            item.updated_at = common.dateFormatter(item.updated_at, 'MM-DD HH:m');
            item.statusList = [];

            const statusArray = item.status.split(/\||,/).map(sess => sess.trim()).filter(title => !!title);

            statusArray.map(function (sess) {
                if (params.cate == 2) {
                    const idx = sessionTitle.findIndex(title => title == sess);

                    item.statusList.push(idx)
                } else {
                    const idx = tutorialTitle.findIndex(title => title == sess);
                    item.statusList.push(idx);
                    item.additionalInfo = statusArray.join(' | ')

                }
            });

            console.log(item.statusList);

        });

        const renderFile = params.cate == 2 ? 'reservation_download' : 'tutorial_download';

        res.render(BLITITOR.site.manageTheme + '/manage/' + renderFile, params);
    });
}

module.exports = {
    form: reservationForm,
    register: createReservation,
    list: reservationList,
    status: reservationStatusList,
    sendSecret: generateSecret,
    manageHome: reservationManageHome,
    manage: reservationManage,
    manageFullList: reservationListFull
};

function categoryIndex(value) {
    return categoryList.findIndex(function (item) {
        return item === value
    })
}

function reservationForm_legacy(req, res) {
    const params = {
        category: req.params['cate'] || req.query['cate'] || categoryID,
    };

    const mysql = connection.get();

    db.readReservationStatus(mysql, params.category, function (error, results) {
        params.status = results;
        params.closedTutorial = true;

        const maxTutorials = results.length;

        for (let i = 0; i < maxTutorials; i++) {
            if (results[i].counter < results[i].max_count) {
                params.closedTutorial = false;

                winston.verbose('Tutorial Section is not closed');

                break;
            }
        }

        return res.render(BLITITOR.site.theme + '/page/reservation/form', params);
    });
}

