var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var controllerHubFlag = misc.commonFlag().controllerHub;

var tables = {
    controller: common.databaseDefault.prefix + 'controller',
    user: common.databaseDefault.prefix + 'user'  // refer `module/account/lib/database.js`
};

var Queries = require('./query');

var fields_storeApp = ['id', 'controller_name', 'created_at', 'updated_at'];

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
    var tableList = [tables.controller];

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

    connection.query(sql_controller, tables.controller, function (error, result) {
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