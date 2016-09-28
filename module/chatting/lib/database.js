var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    chat : common.databaseDefault.prefix + 'chatting_log',
    user: common.databaseDefault.prefix + 'user',
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
    var tableList = [tables.chat];

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
        '`from_id` int unsigned not null, ' +
        '`to_id` int unsigned not null, ' +
        '`message` text, ' +
        '`created_at` datetime ,' +
        'INDEX from_id(`from_id`) ,' + 
		'INDEX to_id(`to_id`))';

    connection.query(sql_chatting, tables.chat, function (error, result) {
        // check dummy json
        callback && callback(databaseConfiguration, done);

        // close connection
        connection.destroy();
    });
}

function selectAuthIDByUUID(connection, UUID, callback) {
    connection.query(query.selectByUUID, ['auth_id', tables.user, UUID], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }
        return callback(err, rows[0]);
    });
}

function insertChattingLog(connection, chatInfo, callback){
    connection.query(query.insertInto, [tables.chat, chatInfo], function (err, result) {
        callback(err, result);
    });
}

function insertDummy(databaseConfiguration, done) {
    done && done();
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    writeChattingLog: insertChattingLog,
    readAccountByUUID: selectAuthIDByUUID,
    option: {
        tables: tables
    }
};
