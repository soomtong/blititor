var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    teamblog: common.databaseDefault.prefix + 'teamblog',
    teamblogHistory: common.databaseDefault.prefix + 'teamblog_history',
    user: common.databaseDefault.prefix + 'user'  // refer `module/account/lib/database.js`
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
    var tableList = [tables.teamblog, tables.teamblogHistory];

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

    var sql_teamblog = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_uuid` char(36) not null, `user_id` int unsigned not null, ' +
        '`nickname` varchar(64), ' +
        '`flag` varchar(1), ' +
        '`title` varchar(256), ' +
        '`content` text, ' +
        '`tags` text, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX user_id(`user_id`))';
    var sql_teamblog_history = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`post_id` int unsigned not null, ' +
        '`title` varchar(256), ' +
        '`content` text, ' +
        '`tags` text, ' +
        '`created_at` datetime, ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX post_id(`post_id`))';
    var sql_fkey_user_id = 'alter table ?? ' +
        'add constraint teamblog_user_id_foreign foreign key (`user_id`) ' +
        'references ?? (`id`)';

    connection.query(sql_teamblog, tables.teamblog, function (error, result) {
        connection.query(sql_teamblog_history, tables.teamblog, function (error, result) {
            // bind foreign key
            connection.query(sql_fkey_user_id, [tables.teamblog, tables.user], function (error, result) {
                // check dummy json
                callback && callback(databaseConfiguration, done);

                // close connection
                connection.destroy();
            });
        });
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

            getAnyAuthor(connection, function (err, author) {
                var dummy = require('./dummy.json');

                var iteratorAsync = function (item, callback) {
                    var teamblogData = {
                        user_uuid: author.uuid,
                        user_id: author.id,
                        nickname: author.nickname,
                        title: item.title,
                        content: item.content,
                        tags: item.tags,
                        created_at: new Date()
                    };

                    insertPost(connection, teamblogData, function (err, result) {
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

function selectByPage(connection, page, callback) {
    var pageSize = 5;
    var fields = ['id', 'user_uuid', 'user_id', 'nickname', 'title', 'content', 'tags', 'created_at', 'updated_at'];
    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        maxPage: 0,
        pageSize: pageSize,
        teamblogList: []
    };

    connection.query(query.countAll, [tables.teamblog], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.maxPage = maxPage;
        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.countAllGroupByMonth, ['created_at', 'created_at', tables.teamblog, 'created_at', 'created_at', 'created_at'], function (err, results) {
            result.postGroupList = results;

            connection.query(query.readTeamblogByPage, [fields, tables.teamblog, result.index, pageSize], function (err, rows) {
                if (!err) result.teamblogList = rows;
                callback(err, result);
            });
        });
    });
}

function selectAllByMonth(connection, year, month, callback) {
    var fields = ['id', 'user_uuid', 'user_id', 'nickname', 'title', 'content', 'tags', 'created_at', 'updated_at'];
    var result = {
        total: 0,
        teamblogList: []
    };

    connection.query(query.countAllGroupByMonth, ['created_at', 'created_at', tables.teamblog, 'created_at', 'created_at', 'created_at'], function (err, results) {
        result.postGroupList = results;

        if (year < 1900 || year > 3000) year = Date.now().getFullYear();
        if (month < 0 || month > 12) month = Date.now().getMonth() + 1;

        console.log(year, month);

        connection.query(query.readTeamblogMonthlyAll, [fields, tables.teamblog, 'created_at', year, 'created_at', month], function (err, rows) {
            result.teamblogList = rows;
            callback(err, result);
        });
    });
}

function selectPost(connection, limit, callback) {
    var fields = ['id', 'user_uuid', 'user_id', 'nickname', 'title', 'content', 'tags', 'created_at', 'updated_at'];

    connection.query(query.readTeamblogRecently, [fields, tables.teamblog, Number(limit)], function (err, rows) {
        callback(err, rows);
    })
}

function insertPost(connection, teamblogData, callback) {
    connection.query(query.insertInto, [tables.teamblog, teamblogData], function (err, result) {
        callback(err, result);
    });
}

function updatePost(connection, teamblogID, replyData, callback) {
    connection.query(query.updateByID, [tables.teamblog, replyData, teamblogID], function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readTeamblogByPage: selectByPage,
    readTeamblogAll: selectAllByMonth,
    readTeamblogRecently: selectPost,
    writePost: insertPost,
    updatePost: updatePost,
    option: {
        tables: tables
    }
};
