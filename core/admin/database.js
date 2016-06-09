var mysql = require('mysql');
var winston = require('winston');

var common = require('../lib/common');
var misc = require('../lib/misc');

var tables = misc.databaseTable();

function createDatabase(connection, dbName) {
    var sql_database = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';   // utf8

    connection.query(sql_database, [dbName, 'utf8'], function (error, result) {
        if (error) {
            console.log(' = Create database... Failed. Make Database yourself'.red);

            console.error('error connecting: ' + error);
        } else {
            console.log(' = Create database... Done \n'.green);
        }

        connection.destroy();
    });
}

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tables = [tables.site];

    connection.query(sql, tables, function (error, results, fields) {
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

    var sql_site = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`title` varchar(64), `value` varchar(256), ' +
        '`created_at` datetime)';

    connection.query(sql_site, tables.site, function (error, result) {
        connection.query('insert into `site` SET ?', {
            'created_at': new Date(),
            'title': 'title',
            'value': 'simplestrap demo'
        }, function (error, result) {
            // close connection
            connection.destroy();
        });
    });
}

module.exports = {
    createDatabase: createDatabase,
    deleteScheme: deleteScheme,
    createScheme: createScheme
};