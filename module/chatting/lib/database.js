var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    chat : common.databaseDefault.prefix + 'chatting_log'
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

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy.json');
            var iteratorAsync = function (item, callback) {
                var guestbookData = {
                    nickname: item.nickname,
                    email: item.email,
                    password: 'hash_0$0zVQQ3ovSe1I0DYFpv4czeDuXxNsGdOuKZJKoHliMi/V0VV/./sMm',
                    message: item.message,
                    flag: '',
                    created_at: new Date(),
                    reply: item.reply || undefined,
                    replied_at: item.reply ? new Date() : undefined
                };

                insertMessage(connection, guestbookData, function (err, result) {
                    console.log('   inserted records...'.white, result.insertId);

                    callback(null, result);
                });
            };
            var resultAsync = function (err, result) {
                console.log(' = Inserted default records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    option: {
        tables: tables
    }
};
