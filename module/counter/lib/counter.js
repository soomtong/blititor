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

function accountCounter(uuid, type) {
    // insert uuid and login type and now date
    var logData = {
        uuid: uuid,
        type: type,
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
            console.log(result);
            winston.verbose('Insert user sign in result info into `account_counter_log` table record:', uuid);
        }
    });

    db.updateAccountCounter(mysql, counterData, function (error, result) {
        if (error) {
            winston.error(error);
        } else {
            console.log(result);
            winston.verbose('Updated last logged info into `account_counter` table record:', uuid);
        }
    });
}

module.exports = {
    index: indexPage,
    insertAccountCounter: accountCounter,
    insertActionCounter: indexPage,
    insertPageCounter: indexPage,
    insertVisitCounter: indexPage
};