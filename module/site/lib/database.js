var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    site: 'b_site'
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
    var tableList = [tables.site];

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

    var sql_site = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`title` varchar(64), `value` varchar(256), ' +
        '`created_at` datetime)';

    connection.query(sql_site, tables.site, function (error, result) {
        connection.query('insert into ?? SET ?', [tables.site ,{
            'created_at': new Date(),
            'title': 'title',
            'value': 'simplestrap demo'
        }], function (error, result) {
            // close connection
            connection.destroy();
        });
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    option: {
        tables: tables,
        core: true
    }
};