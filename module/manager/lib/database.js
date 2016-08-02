// var async = require('neo-async');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    auth: common.databaseDefault.prefix + 'auth',
    user: common.databaseDefault.prefix + 'user',
    accountLog: common.databaseDefault.prefix + 'account_counter_log',
    accountCounter: common.databaseDefault.prefix + 'account_counter',
    visitLog: common.databaseDefault.prefix + 'visit_counter_log',
    visitCounter: common.databaseDefault.prefix + 'visit_counter'
};

var query = require('./query');

function selectAccountByPage(connection, page, callback) {
    var pageSize = 10;
    var fields = ['user_id', 'uuid', 'nickname', 'level', 'grant', 'login_counter', 'last_logged_at', 'created_at', 'updated_at'];
    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        maxPage: 0,
        pageSize: pageSize,
        teamblogList: []
    };

    connection.query(query.countAllAccount, [tables.auth, tables.user], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.maxPage = maxPage;
        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.readAccountByPage, [fields, tables.auth, tables.user, result.index, pageSize], function (err, rows) {
            if (!err) result.accountList = rows;
            callback(err, result);
        });
    });
}

function readVisitLogByPage(connection, page, callback) {
    var pageSize = 10;
    var fields = ['path', 'method', 'ip', 'ref', 'client', 'device', 'created_at'];
    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        maxPage: 0,
        pageSize: pageSize,
        teamblogList: []
    };

    connection.query(query.countAllVisitLog, [tables.visitLog], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.maxPage = maxPage;
        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.readVisitLogByPage, [fields, tables.visitLog, result.index, pageSize], function (err, rows) {
            if (!err) result.visitLogList = rows;
            callback(err, result);
        });
    });
}

function selectAccountCounterByMonth(connection, month, callback) {
    var fields = ['date', 'session_init', 'sign_up', 'sign_in', 'sign_out', 'deactivated', 'reactivated'];
    var result = {
        total: 0,
        month: month + '%',
        index: 0,
        maxPage: 0,
        accountCounter: []
    };

    connection.query(query.readAccountCounterByMonth, [fields, tables.accountCounter, result.month], function (err, rows) {
        if (!err) result.accountCounter = rows;
        callback(err, result);
    });
}

function selectVisitCounterByDate(connection, dates, callback) {
    var result = {
        sum: [],
        visitCounter: []
    };

    // todo: have to refactoring, it's ugly!!!
    connection.query(query.readVisitCounter, [tables.visitCounter], function (err, sums) {
        if (!err) result.sum = sums;

        connection.query(query.readVisitCounterByDate, [dates[0], dates[1], dates[2], dates[3], dates[4], dates[5], dates[6], dates[7], tables.visitCounter], function (err, rows) {
            if (!err) result.visitCounter = rows;

            callback(err, result);
        });
    });
}

module.exports = {
    readAccountByPage: selectAccountByPage,
    readVisitCounterByDate: selectVisitCounterByDate,
    readVisitLogByPage: readVisitLogByPage,
    readAccountCounterByMonth: selectAccountCounterByMonth
};
