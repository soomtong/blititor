var fs = require('fs');
var path = require('path');
var async = require('neo-async');
var winston = require('winston');
var request = require('superagent');

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

        return res.render(BLITITOR.config.site.theme + '/page/reservation/form', params);
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

        res.render(BLITITOR.config.site.theme + '/page/reservation/status_list', params);
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

        var mysql = connection.get();

        if (reservation) {
            // go update
            params = {
                id: reservation.id,
                reservationData: {
                    info: req.body.register_info,
                    updated_at: new Date(),
                    status: sectionStatusData.join(',')
                }
            };

            db.updateReservation(mysql, params, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

                    return res.redirect('back');
                }

                winston.warn('Updated reservation Count:', result.changedRows);

                params.name = reservationData.name;
                params.mode = '갱신 완료';

                if (sectionStatusData.length) {
                    getReservationStatusByID(sectionStatusData, function (error, rows) {
                        params.sectionList = rows;

                        return res.render(BLITITOR.config.site.theme + '/page/reservation/done', params);
                    })
                } else {
                    return res.render(BLITITOR.config.site.theme + '/page/reservation/done', params);
                }

            });
        } else {
            // go insert
            reservationData.info = req.body.register_info;
            reservationData.status = sectionStatusData.join(',');
            reservationData.created_at = new Date();
            reservationData.updated_at = new Date();

            db.createReservation(mysql, reservationData, function (err, result) {
                if (err) {
                    req.flash('error', {msg: err});

                    winston.error(err);

                    return res.redirect('back');
                }

                winston.warn('Inserted reservation ID:', result.insertId);

                params.name = reservationData.name;
                params.mode = '입력 완료';

                if (sectionStatusData.length) {
                    getReservationStatusByID(sectionStatusData, function (error, rows) {
                        params.sectionList = rows;

                        return res.render(BLITITOR.config.site.theme + '/page/reservation/done', params);
                    })
                } else {
                    return res.render(BLITITOR.config.site.theme + '/page/reservation/done', params);
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

    winston.info('Generated phone secret number', params);

    req.session.reservation = params;

    // post request to phone message service
    var host = 'http://welltag.com/kosscon2016/sms_send.asp';

    request
        .post(host)
        .type('form')
        .send({hp: params.phone, code: params.secretNumber})
        .end(function (error, response) {
            // Calling the end function will send the request
            if (response.statusCode == 200 && response.text.includes('"result_code":"200"')) {
                res.send({
                    "status": "success",
                    "data": {
                        "phone": params.phone
                    }
                });
            } else {
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


module.exports = {
    form: reservationForm,
    register: createReservation,
    list: reservationList,
    status: reservationStatusList,
    sendSecret: generateSecret
};

