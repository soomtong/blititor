const fs = require('fs');
const async = require('neo-async');

const mysql = require('mysql');
const winston = require('winston');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const databaseDefault = misc.getDatabaseDefault();

const tables = {
    notice: databaseDefault.tablePrefix + 'notice',
    noticeFeedback: databaseDefault.tablePrefix + 'notice_feedback',
    user: databaseDefault.tablePrefix + 'user'  // refer `module/account/lib/database.js`
};

const query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const sql = "DROP TABLE IF EXISTS ??";
    const tableList = [tables.notice, tables.noticeFeedback];

    connection.query(sql, [tableList], function (error, results, fields) {
        connection.destroy();

        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const charSet = 'utf8mb4';

    const sql_notice_list = 'CREATE TABLE IF NOT EXISTS ?? ' +
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
    const sql_notice_feedback = 'CREATE TABLE IF NOT EXISTS ?? ' +
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
            const connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || databaseDefault.port,
                database: databaseConfiguration.dbName || databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            getAnyAuthor(connection, function (err, author) {
                const dummy = require('./dummy.json');
                const iteratorAsync = function (item, callback) {
                    const noticeItem = {
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
                const resultAsync = function (err, result) {
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
    const fields = ['id', 'uuid', 'auth_id', 'nickname'];

    connection.query(query.anyAuthor, [fields, tables.user, 'm'], function (error, results) {
        callback(error, results[0]);
    });
}

function insertNotice(connection, noticeData, callback) {
    connection.query(query.insertInto, [tables.notice, noticeData], function (err, result) {
        callback(err, result);
    });
}

function updateNotice(connection, noticeData, noticeID, callback) {
    connection.query(query.updateByID, [tables.notice, noticeData, noticeID], function (err, result) {
        callback(err, result);
    });
}

function selectNotices(connection, params, callback) {
    const pageSize = 5;
    const gutterSize = 5;
    const gutterMargin = 2;

    const result = {
        page: Math.abs(Number(params.page)),
        noticeList: []
    };

    connection.query(query.countAll, [tables.notice], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        const pagination = common.pagination(result.page, result.total, pageSize, gutterSize, gutterMargin);
        const fields = ['A.id', 'title', 'body', 'B.avatar', 'A.nickname', 'hit_count', 'A.created_at', 'A.updated_at'];
        const prepared = [fields, tables.notice, tables.user, params.category, pagination.index, pagination.pageSize];

        connection.query(query.readNoticeListByPageWithAuthor, prepared, function (err, rows) {
            if (!err) {
                result.noticeList = rows;
            }

            result.pagination = pagination;

            callback(err, result);
        });
    });
}

function deleteNotice(connection, noticeID, callback) {
    connection.query(query.deleteByID, [tables.notice, noticeID], function (err, result) {
        callback(err, result);
    });
}

function selectNotice(connection, params, callback) {
    const result = {
        noticeItem: {}
    };

    const fields = ['id', 'title', 'body', 'nickname', 'hit_count', 'created_at', 'updated_at'];
    const prepared = [fields, tables.notice, params.notice_id];

    connection.query(query.selectByID, prepared, function (err, rows) {
        if (!err) {
            result.noticeItem = rows[0];
        }

        callback(err, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readNoticeList: selectNotices,
    createNotice: insertNotice,
    removeNotice: deleteNotice,
    readNotice: selectNotice,
    updateNotice: updateNotice,
    option: {
        tables: tables,
        core: false
    }
};
