var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

// logged user view: account,
// all user view(==page view): visit
var tables = {
    accountLog: common.databaseDefault.prefix + 'account_counter_log',
    accountCounter: common.databaseDefault.prefix + 'account_counter',
    visitLog: common.databaseDefault.prefix + 'visit_counter_log',
    visitCounter: common.databaseDefault.prefix + 'visit_counter',
    sessionLog: common.databaseDefault.prefix + 'session_counter_log'
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
        tables.visitLog, tables.visitCounter,
        tables.sessionLog
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
        '`client` varchar(96), ' +
        '`device` varchar(64), ' +
        '`created_at` datetime, ' +
        'INDEX account_log_uuid(`uuid`))';
    var sql_account_counter = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`session_init` int unsigned default 0, `sign_up` int unsigned default 0, ' +
        '`sign_in` int unsigned default 0, `sign_out` int unsigned default 0, ' +
        '`deactivated` int unsigned default 0, `reactivated` int unsigned default 0, ' +
        '`date` char(8), ' +
        'UNIQUE account_counter_date_unique(`date`))';
    var sql_visit_log = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`path` varchar(96) not null,' +
        '`method` varchar(8),' +
        '`ip` varchar(18), ' +  // prepare ipv6, consider to use numeric
        '`ref` varchar(96), ' +
        '`client` varchar(96), ' +
        '`device` varchar(64), ' +
        '`created_at` datetime, ' +
        'INDEX visit_log_path(`path`))';
    var sql_visit_counter = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`path` varchar(96) not null,' +
        '`date` char(8) not null, ' +
        '`view` int unsigned default 0, ' +
        'INDEX visit_counter_path(`path`))';
    var sql_session_log = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`session` varchar(96) not null,' +
        '`uuid` char(36), ' +
        '`created_at` datetime, ' +
        'INDEX session_log_session(`session`))';

    connection.query(sql_account_log, tables.accountLog, function (error, result) {
        connection.query(sql_account_counter, tables.accountCounter, function (error, result) {
            connection.query(sql_visit_log, tables.visitLog, function (error, result) {
                connection.query(sql_visit_counter, tables.visitCounter, function (error, result) {
                    connection.query(sql_session_log, tables.sessionLog, function (error, result) {
                        // console.log(error, result);
                        // for dummy
                        callback && callback(databaseConfiguration, done);

                        connection.destroy();
                    })
                });
            });
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

function insertAccountActionLog(connection, logData, callback) {
    connection.query(query.insertInto, [tables.accountLog, logData], function (error, result) {
        callback(error, result);
    });
}

function updateAccountCounter(connection, counterData, callback) {
    connection.query(query.selectByDate, [tables.accountCounter, counterData.date], function (error, rows) {
        if (rows[0] && rows[0].id) {
            connection.query(query.updateCounterByDate, [tables.accountCounter, counterData.type, counterData.type, counterData.date], function (error, result) {
                callback(error, result);
            });
        } else {
            connection.query(query.insertCounterByDate, [tables.accountCounter, counterData.type, counterData.date], function (error, result) {
                callback(error, result);
            });
        }
    });
}

function insertPageViewLog(connection, logData, callback) {
    connection.query(query.insertInto, [tables.visitLog, logData], function (error, result) {
        callback(error, result);
    });
}

function updatePageCounter(connection, counterData, callback) {
    connection.query(query.selectByDateWithPath, [tables.visitCounter, counterData.date, counterData.path], function (error, rows) {
        if (rows[0] && rows[0].id) {
            connection.query(query.updateCounterByDateWithPath, [tables.visitCounter, counterData.date, counterData.path], function (error, result) {
                callback(error, result);
            });
        } else {
            connection.query(query.insertCounterByDateWithPath, [tables.visitCounter, counterData.path, counterData.date], function (error, result) {
                callback(error, result);
            });
        }
    });
}

function selectSession(connection, sessData, callback) {
    connection.query(query.selectBySessionID, [tables.sessionLog, sessData], function (error, rows) {
        callback(error, rows);
    });
}

function insertSession(connection, sessData, callback) {
    connection.query(query.insertInto, [tables.sessionLog, sessData], function (error, result) {
        callback(error, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    insertAccountActionLog: insertAccountActionLog,
    updateAccountCounter: updateAccountCounter,
    insertPageViewLog: insertPageViewLog,
    updatePageCounter: updatePageCounter,
    selectSession: selectSession,
    insertSessionLog: insertSession,
    option: {
        tables: tables,
        core: true
    }
};
