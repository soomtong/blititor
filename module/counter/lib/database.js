var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    accountLog: common.databaseDefault.prefix + 'account_counter_log',
    accountCounter: common.databaseDefault.prefix + 'account_counter',
    visitLog: common.databaseDefault.prefix + 'visit_counter_log',
    visitCounter: common.databaseDefault.prefix + 'visit_counter'
};

var query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [
        tables.accountLog, tables.accountCounter,
        tables.visitLog, tables.visitCounter
    ];

    connection.query(sql, [tableList], function (error, results, fields) {
        connection.destroy();
        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql_account_log = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`uuid` char(36) not null, `type` int(4) unsigned not null, ' +
        '`created_at` datetime, ' +
        'INDEX account_log_uuid(`uuid`))';
    var sql_account_counter = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`sign_in` int unsigned default 0, `sign_out` int unsigned default 0, ' +
        '`registered` int unsigned default 0, `resigned` int unsigned default 0, ' +
        '`deactivated` int unsigned default 0, `activated` int unsigned default 0, ' +
        '`date` char(8), ' +
        'UNIQUE account_counter_date_unique(`date`))';

    connection.query(sql_account_log, tables.accountLog, function (error, result) {
        // console.log(error, result);
        connection.query(sql_account_counter, tables.accountCounter, function (error, result) {
            // console.log(error, result);
            // for dummy
            callback && callback(databaseConfiguration, done);

            connection.destroy();
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 2) {
        }
    });
}

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

function selectByUUID(connection, uuid, callback) {
    var fields = ['user_id', 'user_password', 'uuid', 'nickname', 'photo', 'desc', 'level', 'grant', 'point', 'login_counter', 'last_logged_at', 'created_at', 'updated_at'];

    connection.query(query.selectAccountByUUID, [fields, tables.auth, tables.user, uuid], function (err, rows) {

        callback(err, rows[0]);
    });
}

function insertAccountCounterLog(connection, counterData, callback) {
    var q =connection.query(query.insertInto, [tables.accountLog, counterData], function (error, result) {
        callback(error, result);
    });

    console.log(q.sql);

}

function updateAccountCounter(connection, counterData, callback) {
    connection.query(query.selectByDate, [tables.accountCounter, counterData.date], function (error, rows) {
        if (rows[0] && rows[0].id) {
            var q = connection.query(query.updateCounterByDate, [tables.accountCounter, counterData.type, counterData.type, counterData.date], function (error, result) {
                callback(error, result);
            });
            console.log(q.sql);
        } else {
            var p = connection.query(query.insertCounterByDate, [tables.accountCounter, counterData.type, counterData.date], function (error, result) {
                callback(error, result);
            });
            console.log(p.sql);
        }
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    insertAccountCounter: insertAccountCounterLog,
    updateAccountCounter: updateAccountCounter,
    option: {
        tables: tables,
        core: true
    }
};
