// var async = require('neo-async');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    auth: common.databaseDefault.prefix + 'auth',
    user: common.databaseDefault.prefix + 'user',
    accountLog: common.databaseDefault.prefix + 'account_counter_log'
};

var query = require('./query');

function selectByPage(connection, page, callback) {
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

function selectByAccountUUID(connection, uuid, callback) {
    var fields = ['user_id', 'user_password', 'uuid', 'nickname', 'photo', 'desc', 'level', 'grant', 'point', 'login_counter', 'last_logged_at', 'created_at', 'updated_at'];

    connection.query(query.selectAccountByUUID, [fields, tables.auth, tables.user, uuid], function (err, rows) {

        callback(err, rows[0]);
    });
}

function selectAuthIDByUUID(connection, UUID, callback) {
    connection.query(query.selectByUUID, ['auth_id', tables.user, UUID], function (err, rows) {
        callback(err, rows[0]);
    });
}

function updateAuthByID(connection, authData, authID, callback) {
    connection.query(query.updateByID, [tables.auth, authData, authID], function (err, result) {
        callback(err, result);
    });
}

function updateByUUID(connection, userData, UUID, callback) {
    connection.query(query.updateAccountByUUID, [tables.user, userData, UUID], function (err, result) {
        callback(err, result);
    });
}

function selectByAccountLogUUID(connection, UUID, callback) {
    var fields = ['id', 'type', 'client' , 'device', 'created_at'];

    connection.query(query.selectByUUIDWithLimit, [fields, tables.accountLog, UUID, 10], function (err, rows) {
        callback(err, rows);
    });
}


module.exports = {
    readAccountByPage: selectByPage,
    readAccount: selectByAccountUUID,
    readAuthIDByUUID: selectAuthIDByUUID,
    updateAuthByID: updateAuthByID,
    updateAccountByUUID: updateByUUID,
    readAccountLog: selectByAccountLogUUID,
};
