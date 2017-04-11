var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var appstoreFlag = misc.commonFlag().appStore;

var tables = {
    storeApp: common.databaseDefault.prefix + 'store_app',
    storeAppHistory: common.databaseDefault.prefix + 'store_app_history',
    storeAppCategory: common.databaseDefault.prefix + 'store_app_category',
    storeAppRelated: common.databaseDefault.prefix + 'store_app_related',
    user: common.databaseDefault.prefix + 'user'  // refer `module/account/lib/database.js`
};

var query = require('./query');

var fields_storeApp = ['id', 'user_uuid', 'user_id', 'nickname', 'download_url', 'title', 'description', 'category_id', 'tags',
                     'price', 'price_discounted', 'image', 'flag', 'pinned', 'created_at', 'updated_at'];

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.storeApp, tables.storeAppHistory, tables.storeAppCategory, tables.storeAppRelated];

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

    var sql_storeApp_category = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category_id` varchar(64), ' +
        '`category_title` varchar(128), ' +
        '`category_subject` varchar(256), ' +
        '`category_count` int unsigned not null DEFAULT 0, ' +
        '`category_order` tinyint unsigned not null DEFAULT 1, ' +
        '`created_at` datetime, ' +
        'UNIQUE category_id_unique(`category_id`), ' +
        'INDEX category_order(`category_order`), ' +
        'INDEX category_count(`category_count`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_storeApp = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_uuid` char(36) not null, `user_id` int unsigned not null, ' +
        '`nickname` varchar(64), ' +
        '`download_url` varchar(256), ' +
        '`title` varchar(256), ' +
        '`price` varchar(16), ' +
        '`price_discounted` varchar(16), ' +
        '`category_id` int unsigned not null DEFAULT 0, ' +
        '`description` varchar(256), ' +
        '`content` text, ' +
        '`tags` varchar(256), ' +
        '`image` varchar(256), ' +    // just 1 image now
        '`flag` varchar(8), ' +             // render type or some special mark for this storeApp
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX category_id(`category_id`), ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX user_id(`user_id`))' +
        'DEFAULT CHARSET=' + charSet;
    var sql_storeApp_history = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`store_app_id` int unsigned not null, ' +
        '`download_url` varchar(256), ' +
        '`title` varchar(256), ' +
        '`category` varchar(128), ' +
        '`content` text, ' +
        '`tags` varchar(256), ' +
        '`created_at` datetime, ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX store_app_id(`store_app_id`))' +
        'DEFAULT CHARSET=' + charSet;
    var sql_storeApp_related = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`store_app_id` int unsigned not null, ' +
        '`related_store_app_id` int unsigned not null, ' +
        '`created_at` datetime, ' +
        'INDEX related_store_app_id(`related_store_app_id`), ' +
        'INDEX store_app_id(`store_app_id`))' +
        'DEFAULT CHARSET=' + charSet;
    var sql_fkey_user_id = 'alter table ?? ' +
        'add constraint storeApp_user_id_foreign foreign key (`user_id`) ' +
        'references ?? (`id`)' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_storeApp_category, tables.storeAppCategory, function (error, result) {
        connection.query(sql_storeApp, tables.storeApp, function (error, result) {
            connection.query(sql_storeApp_history, tables.storeAppHistory, function (error, result) {
                connection.query(sql_storeApp_related, tables.storeAppCategory, function (error, result) {
                    // bind foreign key
                    connection.query(sql_fkey_user_id, [tables.storeApp, tables.user], function (error, result) {
                        // check dummy json
                        callback && callback(databaseConfiguration, done);

                        // close connection
                        connection.destroy();
                    });
                });
            });
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy1.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            getAnyAuthor(connection, function (err, author) {
                var dummy = require('./dummy1.json');

                var iteratorAsync = function (item, callback) {
                    var flag = '';

                    // separated array list
                    var tagList = item.tags && item.tags.split(',').map(function (tag) {
                        return tag.trim();
                    }).filter(function (tag) {
                        return !!tag;
                    });

                    var storeAppData = {
                        user_uuid: author.uuid,
                        user_id: author.id,
                        nickname: author.nickname,
                        title: item.title,
                        category_id: item.category || 0,
                        description: item.description,
                        content: item.content,
                        tags: tagList && tagList.join(','),
                        image: item.image ? item.image.toString() : '',
                        flag: flag.trim(),
                        pinned: item.pinned ? 1 : 0,
                        created_at: new Date()
                    };

                    insertApp(connection, storeAppData, function (err, result) {
                        // console.log(err, result);
                        console.log('   inserted storeApp records...'.white, result['insertId']);

                        callback(err, result);
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

    fs.stat(__dirname + '/dummy2.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy2.json');

            var iteratorAsync = function (item, callback) {
                var storeAppCategoryData = {
                    category_id: item.id,
                    category_title: item.title,
                    category_subject: item.subject,
                    created_at: new Date()
                };

                insertCategory(connection, storeAppCategoryData, function (err, result) {
                    console.log('   inserted storeAppCategory records...'.white, result['insertId']);

                    callback(null, result);
                });
            };

            var resultAsync = function (err, result) {
                console.log(' = Inserted category records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
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
    var pageSize = 10;

    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        maxPage: 0,
        pageSize: pageSize,
        storeAppList: []
    };

    connection.query(query.countAll, [tables.storeApp], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.maxPage = maxPage;
        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.readStoreAppByPage, [fields_storeApp, tables.storeApp, result.index, pageSize], function (err, rows) {
            if (!err) result.storeAppList = rows;
            callback(err, result);
        });
    });
}

function selectAllByMonth(connection, year, month, callback) {
    var result = {
        total: 0,
        storeAppList: []
    };

    connection.query(query.readStoreAppMonthlyAll, [fields_storeApp, tables.storeApp, 'created_at', year, 'created_at', month], function (err, rows) {
        result.storeAppList = rows;
        callback(err, result);
    });
}

function selectAllByCategory(connection, tag, callback) {
    var result = {
        total: 0,
        storeAppList: []
    };

    connection.query(query.readStoreAppByCategoryAll, [tables.storeAppCategory, tables.storeAppCategoryRelated, tables.storeApp, tag], function (err, rows) {
        result.storeAppList = rows;
        callback(err, result);
    });
}

function selectAppRecently(connection, limit, callback) {
    connection.query(query.readStoreAppRecently, [fields_storeApp, tables.storeAppCategory, tables.storeApp, Number(limit)], function (err, rows) {
        callback(err, rows);
    });
}

function selectAppPinned(connection, limit, callback) {
    connection.query(query.readStoreAppPinned, [fields_storeApp, tables.storeApp, appstoreFlag.pinned.value, Number(limit)], function (err, rows) {
        callback(err, rows);
    });
}

function insertCategory(connection, storeAppCategoryData, callback) {
    var existingAppCategory = {
        category_title: storeAppCategoryData.title,
        category_subject: storeAppCategoryData.subject,
        created_at: new Date()
    };

    connection.query(query.insertCategoryInto, [tables.storeAppCategory, storeAppCategoryData, existingAppCategory], function (err, insertAppResult) {
        callback(err, insertAppResult);
    });
}

function insertApp(connection, storeAppData, callback) {
    connection.query(query.insertInto, [tables.storeApp, storeAppData], function (err, insertAppResult) {
        callback(err, insertAppResult);
    });
}

function updateApp (connection, storeAppID, replyData, callback) {
    connection.query(query.updateByID, [tables.storeApp, replyData, storeAppID], function (err, result) {
        callback(err, result);
    });
}

function selectAppByID (connection, storeAppID, callback) {
    connection.query(query.selectByID, [fields_storeApp, tables.storeApp, storeAppID], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }

        callback(err, result);
    });
}

function selectAppByURL(connection, storeAppURL, callback) {
    connection.query(query.selectByURL, [fields_storeApp, tables.storeApp, storeAppURL], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }
        callback(err, result);
    })
}

function selectCategories(connection, callback) {
    connection.query(query.selectAll, [['category_id', 'category_title', 'category_subject'], tables.storeAppCategory], function (error, rows) {
        callback(error, rows);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readStoreAppByPage: selectByPage,
    readStoreAppAllByCategory: selectAllByCategory,
    readStoreAppAllByMonth: selectAllByMonth,
    readStoreAppRecently: selectAppRecently,
    readStoreAppPinned: selectAppPinned,
    readAppByID: selectAppByID,
    readAppByURL: selectAppByURL,
    writeApp: insertApp,
    updateApp: updateApp,
    readCategories: selectCategories,
    option: {
        tables: tables
    }
};
