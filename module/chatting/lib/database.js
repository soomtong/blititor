var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    chattingLog : common.databaseDefault.prefix + 'chatting_log',
    user: common.databaseDefault.prefix + 'user'
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
    var tableList = [tables.chattingLog];

    connection.query(sql, tableList, function (error, results, fields) {
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

    var sql_chatting = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`from_uuid` char(36) not null, ' +
        '`to_uuid` char(36) not null, ' +
        '`message` text, ' +
        '`created_at` datetime ,' +
        'INDEX from_uuid(`from_uuid`) ,' +
		'INDEX to_uuid(`to_uuid`))';

    connection.query(sql_chatting, tables.chattingLog, function (error, result) {
        // check dummy json
        callback && callback(databaseConfiguration, done);

        // close connection
        connection.destroy();
    });
}

function insertDummy(databaseConfiguration, done) {
    done && done();
}

function insertChattingLog(connection, chatInfo, callback){
    connection.query(query.insertInto, [tables.chattingLog, chatInfo], function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    writeChattingLog: insertChattingLog,
    option: {
        tables: tables,
        core: false
    }
};
