var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var controllerHubFlag = misc.commonFlag().controllerHub;

var tables = {
    controller: common.databaseDefault.prefix + 'controller',  // hub info and main controller info
    gateway: common.databaseDefault.prefix + 'gateway',
    gatewayGroup: common.databaseDefault.prefix + 'gateway_group',

    user: common.databaseDefault.prefix + 'user'  // refer `module/account/lib/database.js`
};

var Queries = require('./query');

var PAGE_SIZE = 12;
var GUTTER_SIZE = 10;
var GUTTER_MARGIN = 3;

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.controller, tables.gateway, tables.gatewayGroup];

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

    var sql_controller = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`controller_id` varchar(64), ' +
        '`controller_title` varchar(128), ' +
        '`controller_subject` varchar(256), ' +
        '`created_at` datetime, ' +
        'UNIQUE controller_id_unique(`controller_id`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_gatewayGroup = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`flag` varchar(8), ' +             // for real-time feedback
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`group_title` varchar(128), ' +
        '`group_subject` varchar(256), ' +
        '`group_tag` varchar(64), ' +
        '`group_count` int unsigned not null DEFAULT 0, ' +
        '`group_order` tinyint unsigned not null DEFAULT 1, ' +
        '`created_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX group_order(`group_order`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_gateway = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`gateway_uuid` char(36) not null, ' +
        '`gateway_ip` varchar(16), ' +
        '`version` varchar(32), ' +
        '`title` varchar(256), ' +
        '`group_id` int unsigned not null DEFAULT 0, ' +
        '`content` text, ' +
        '`tags` varchar(256), ' +
        '`image` varchar(256), ' +    // just 1 image now
        '`flag` varchar(8), ' +             // render type or some special mark for this storeApp
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX group_id(`group_id`), ' +
        'INDEX gateway_uuid(`gateway_uuid`),' +
        'INDEX created_at(`created_at`)) ' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_controller, tables.controller, function (error, result) {
        console.log(error, result);
        connection.query(sql_gatewayGroup, tables.controller, function (error, result) {
            console.log(error, result);
            connection.query(sql_gateway, tables.controller, function (error, result) {
                console.log(error, result);

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

            var dummy = require('./dummy.json');

            var iteratorAsync = function (item, callback) {
                var storeAppCategoryData = {
                    controller_id: item.id,
                    controller_title: item.title,
                    controller_subject: item.subject,
                    created_at: new Date()
                };

                insertCategory(connection, storeAppCategoryData, function (err, result) {
                    console.log('   inserted storeAppCategory records...'.white, result['insertId']);

                    callback(null, result);
                });
            };

            var resultAsync = function (err, result) {
                console.log(' = Inserted controller records...'.blue);

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

function insertCategory(connection, storeAppCategoryData, callback) {
    var existingAppCategory = {
        controller_title: storeAppCategoryData.controller_title,
        controller_subject: storeAppCategoryData.controller_subject,
        created_at: new Date()
    };

    connection.query(Queries.insertCategoryInto, [tables.storeAppCategory, storeAppCategoryData, existingAppCategory], function (err, insertAppResult) {
        callback(err, insertAppResult);
    });
}