var fs = require('fs');
var async = require('neo-async');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var databaseDefault = misc.getDatabaseDefault();

var tables = {
    notice: databaseDefault.tablePrefix + 'notice',
    noticeFeedback : databaseDefault.tablePrefix + 'notice_feedback',
    user: databaseDefault.tablePrefix + 'user'  // refer `module/account/lib/database.js`
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
    var tableList = [tables.notice, tables.noticeFeedback];

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

    var charSet = 'utf8mb4';

    var sql_notice_list = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category` tinyint default 1, ' +  // category => hidden notice
        '`user_uuid` char(36) not null, `user_id` int unsigned not null, ' +
        '`nickname` varchar(64), ' +
        '`custom_url` varchar(128), ' +
        '`title` varchar(256), ' +
        '`body` text, ' +
        '`hit_count` int unsigned not null DEFAULT 1, ' +
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX updated_at(`updated_at`), ' +
        'INDEX category(`category`))' +
        'DEFAULT CHARSET=' + charSet;
    var sql_notice_feedback = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`notice_id` int unsigned not null, ' +
        '`type` char(1), ' +
        '`pinned` int unsigned default 0, ' +
        '`created_at` datetime, ' +
        'INDEX notice_id(`notice_id`))' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_notice_feedback, tables.noticeFeedback, function (error, result) {
        connection.query(sql_notice_list, tables.notice, function (error, result) {
            // check dummy json
            callback && callback(databaseConfiguration, done);

            // close connection
            connection.destroy();
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 1) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            getAnyAuthor(connection, function (err, author) {
                var dummy = require('./dummy.json');
                var iteratorAsync = function (item, callback) {
                    var noticeItem = {
                        user_uuid: author.uuid,
                        user_id: author.id,
                        nickname: author.nickname,
                        category: item.category,
                        title: item.title,
                        body: item.body,
                        hit_count: item.hit_count,
                        created_at: new Date(),
                        updated_at: new Date()
                    };

                    insertNotice(connection, noticeItem, function (err, result) {
                        console.log('   inserted records...', result.insertId);

                        callback(null, result);
                    });
                };
                var resultAsync = function (err, result) {
                    console.log(' = Inserted default records...');

                    // for async
                    done && done(err, result);

                    // close connection
                    connection.destroy();
                };

                async.mapSeries(dummy, iteratorAsync, resultAsync);
            });
        }
    });
}

function getAnyAuthor(connection, callback) {
    var fields = ['id', 'uuid', 'auth_id', 'nickname'];

    connection.query(query.anyAuthor, [fields, tables.user], function (error, results) {
        callback(error, results[0]);
    });
}

function insertNotice(connection, noticeData, callback) {
    connection.query(query.insertInto, [tables.notice, noticeData], function (err, result) {
        callback(err, result);
    });
}

function selectNotice(connection, params, callback) {
    var pageSize = 5;
    var gutterSize = 5;
    var gutterMargin = 2;

    var result = {
        page: Math.abs(Number(params.page)),
        noticeList: []
    };

    connection.query(query.countAll, [tables.notice], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var pagination = common.pagination(result.page, result.total, pageSize, gutterSize, gutterMargin);
        var fields = ['id', 'title', 'body', 'nickname', 'hit_count', 'created_at', 'updated_at'];
        var prepared = [fields, tables.notice, params.category, pagination.index, pagination.pageSize]

        connection.query(query.readNoticeListByPage, prepared, function (err, rows) {
            if (!err) {
                result.noticeList = rows;
            }

            result.pagination = pagination;

            callback(err, result);
        });
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readNoticeList: selectNotice,
    // createNotice: insertNotice,
    // updateNotice: updateNotice,
    option: {
        tables: tables,
        core: false
    }
};
