var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    guestbook: common.databaseDefault.prefix + 'guestbook'
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
    var tableList = [tables.guestbook];

    connection.query(sql, tableList, function (error, results, fields) {
        connection.destroy();
        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql_guestbook = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`email` varchar(64) not null, `password` varchar(255) not null, ' +
        '`nickname` varchar(64), ' +
        '`flag` varchar(1), ' +
        '`message` text, ' +
        '`reply` text, ' +
        '`created_at` datetime, ' +
        '`replied_at` datetime)';

    connection.query(sql_guestbook, tables.guestbook, function (error, result) {
        // check dummy json
        callback && callback(databaseConfiguration);        
        
        // close connection
        connection.destroy();
    });
}

function insertDummy(databaseConfiguration) {
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
                console.log(' = Make default records...'.blue);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });
}

function selectByPage(connection, page, callback) {
    var pageSize = 10;
    var fields = ['id', 'nickname', 'message', 'reply', 'created_at', 'replied_at'];
    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        pageSize: pageSize,
        guestbookList: []
    };

    connection.query(query.countAll, [tables.guestbook], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.readGuestbook, [fields, tables.guestbook, result.index, pageSize], function (err, rows) {
            result.guestbookList = rows;
            callback(err, result);
        });
    });
}

function insertMessage(connection, guestbookData, callback) {
    connection.query(query.insertInto, [tables.guestbook, guestbookData], function (err, result) {
        callback(err, result);
    });
}

function updateMessage(connection, guestbookID, replyData, callback) {
    connection.query(query.updateByID, [tables.guestbook, replyData, guestbookID], function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readGuestbook: selectByPage,
    writeMessage: insertMessage,
    writeReply: updateMessage,
    option: {
        tables: tables
    }
};
