var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    guestbook: 'b_guestbook'
};

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

function createScheme(databaseConfiguration) {
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
        // todo: refactoring global path
        fs.stat('./module/guestbook/lib/dummy.json', function (error, result) {

            if (!error && result.size > 2) {
                var dummy = require('./dummy.json');

                console.log(dummy);

                // make dummy records
                console.log(' = Make default records...'.blue);
            }

            // close connection
            connection.destroy();
        });        
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    option: {
        tables: tables
    }
};