var fs = require('fs');
var util = require('util');
var path = require('path');
var async = require('neo-async');
var winston = require('winston');
var request = require('request');

var slack = require('../../slack');
var mailgun = require('../../mailgun');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var db = require('./database');

function reservationForm(req, res) {
    var params = {
        category: req.params['cate'] || req.query['cate'] || 1,
    };

    var mysql = connection.get();

    db.readReservationStatus(mysql, params.category, function (error, results) {
        params.status = results;
        params.closedTutorial = true;

        var maxTutorials = results.length;

        for (var i = 0; i < maxTutorials; i++) {
            if (results[i].counter < results[i].max_count) {
                params.closedTutorial = false;

                winston.verbose('Tutorial Section is not closed');

                break;
            }
        }

        return res.render(BLITITOR.site.theme + '/page/reservation/form', params);
    });
}

function reservationList(req, res) {
    var params = {
        category: req.params['cate'] || req.query['cate'] || 1,
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readReservationList(mysql, params, function (error, result) {
        return res.send(result);
    });
}

function reservationStatusList(req, res) {
    var params = {
        category: req.params['cate'] || req.query['cate'] || 1,
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readReservationStatus(mysql, params.category, function (error, result) {
        params.cateList = result || [];

        res.render(BLITITOR.site.theme + '/page/reservation/status_list', params);
    });
}

function createReservation(req, res) {
    var reservedSession = req.session['reservation'] || {};

    req.assert('register_name', 'Name is required').len(2, 20).withMessage('Must be between 2 and 10 chars long').notEmpty();
    req.assert('register_email', 'Email is required').notEmpty().withMessage('Email ID should be email type string').isEmail();
    req.assert('register_phone', 'Phone number is required').notEmpty();
    req.assert('register_phone_secret', '휴대폰 인증정보가 일치하지 않습니다.').equals(reservedSession.secretNumber);

    var errors = req.validationErrors();

    if (errors) {
        winston.error('phone number with secret number', reservedSession.phone, reservedSession.secretNumber);
        winston.warn(errors);
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('register_name').escape();
    req.sanitize('register_email').trim();
    req.sanitize('register_phone').trim();

    // remove dash in phone field
    var reservationData = {
        category: 1,
        name: req.body.register_name,
        email: req.body.register_email,
        phone: req.body.register_phone.replace(/-/g, '')
    };

    // custom data for status
    var sectionStatusData = [];

    if (req.body.register_apply_tutorial1) sectionStatusData.push(req.body.register_apply_tutorial1);
    if (req.body.register_apply_tutorial2) sectionStatusData.push(req.body.register_apply_tutorial2);
    if (req.body.register_apply_tutorial3) sectionStatusData.push(req.body.register_apply_tutorial3);

    // console.log(reservationData, sectionStatusData);

    var params = {};

    findReservationByGiven(reservationData, function (error, reservation) {

        var slackChannel = "C2SM667BP";

        var mysql = connection.get();

        if (reservation) {
            // go update
            params = {
                id: reservation.id,
                reservationData: {
                    info: req.body.register_info,
                    updated_at: new Date(),
                    status: sectionStatusData.join(',')
                },
                prevReservationStatus: reservation.status
            };

            updateReservationStatus(params.reservationData.status, params.prevReservationStatus);

            db.updateReservation(mysql, params, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

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

                        return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                    });
                } else {
                    return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                }
            });
        } else {
            // go insert
            reservationData.info = req.body.register_info;
            reservationData.status = sectionStatusData.join(',');
            reservationData.created_at = new Date();
            reservationData.updated_at = new Date();

            updateReservationStatus(reservationData.status);

            db.createReservation(mysql, reservationData, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

                    return res.redirect('back');
                }

                winston.warn('Inserted reservation ID:', result.insertId);

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

                        return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                    });
                } else {
                    return res.render(BLITITOR.site.theme + '/page/reservation/done', params);
                }
            });
        }
    });
}

function generateSecret(req, res) {
    var params = {
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
    var smsToken = misc.serviceToken('sms_api');
    var smsProvider = misc.serviceProvider('sms_api');
    var sender = '01045151082';

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
    var mysql = connection.get();

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
    var mysql = connection.get();

    db.readReservationStatusByID(mysql, sectionData, function (err, rows) {
        callback(err, rows);
    });
}

function updateReservationStatus(status, prevStatus) {
    var mysql = connection.get();

    // decrease
    if (prevStatus) {
        prevStatus = prevStatus.split(','); // in fact it's bad habit, i know. will go into details next time.

        prevStatus.map(function (item) {
            db.decreaseReservationStatus(mysql, item, function (error, result) {
                winston.info('decreased status', item);
            });
        });
    }

    // increase
    if (status) {
        status = status.split(','); // in fact it's bad habit, i know. will go into details next time.

        status.map(function (item) {
            db.increaseReservationStatus(mysql, item, function (error, result) {
                winston.info('decreased status', item);
            });
        });
    }
}

module.exports = {
    form: reservationForm,
    register: createReservation,
    list: reservationList,
    status: reservationStatusList,
    sendSecret: generateSecret
};

