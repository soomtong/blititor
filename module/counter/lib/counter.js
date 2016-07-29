/*
* [counter type=login] (value)
* account counter = {login, logout}
* visit counter = {session counter, browser counter, referrer counter}
* page counter = {page access, page rank}
* action counter = {post, comment, search}
* */
var winston = require('winston');
var moment = require('moment');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var db = require('./database');

function indexPage(req, res) {
    var params = {
        title: "관리자 화면",
        page: Number(req.query['p']) || 1
    };
}

function accountCounter(uuid, type, agent, device) {
    // insert uuid and login type and now date
    var logData = {
        uuid: uuid,
        type: type,
        client: agent.toString(),
        device: device.name + " (" + device.type  + ")",
        created_at: new Date()
    };

    var counterData = {
        type: 'sign_in',
        date: moment().format('YYYYMMDD')
    };

    var mysql = connection.get();

    db.insertAccountCounter(mysql, logData, function (error, result) {
        if (error) {
            winston.error(error);
        } else {
            winston.verbose('Insert user sign-in record:', uuid);
        }
    });

    db.updateAccountCounter(mysql, counterData, function (error, result) {
        if (error) {
            winston.error(error);
        } else {
            winston.verbose('Updated last logged info record:', uuid);
        }
    });
}

function pageCounter(page, ip, ref, agent, device) {
    var logData = {
        page: common.pageFormatter(page),
        ip: ip,
        ref: ref,
        client: agent.toString(),
        device: device.name + " (" + device.type  + ")",
        created_at: new Date()
    };
    var counterData = {
        page: common.pageFormatter(page),
        date: moment().format('YYYYMMDD')
    };

    var mysql = connection.get();

    // insert log
    console.log(logData);

    // update counter
    console.log(counterData);
}

module.exports = {
    index: indexPage,
    insertAccountCounter: accountCounter,
    insertPageCounter: pageCounter,
    insertActionCounter: indexPage,
    insertVisitCounter: indexPage
};