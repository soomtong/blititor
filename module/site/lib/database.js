const mysql = require('mysql');
const winston = require('winston');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const databaseDefault = misc.getDatabaseDefault();

const tables = {
    site: databaseDefault.tablePrefix + 'site'
};

function deleteScheme(databaseConfiguration, callback) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const sql = "DROP TABLE IF EXISTS ??";
    const tableList = [tables.site];

    connection.query(sql, tableList, function (error, results, fields) {
        connection.destroy();
        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const charSet = 'utf8mb4';

    const sql_site = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`title` varchar(64), `value` varchar(256), ' +
        '`created_at` datetime)' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_site, tables.site, function (error, result) {
        callback && callback(databaseConfiguration, done);

        // close connection
        connection.destroy();
    });
}

function insertDummy(databaseConfiguration, done) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    connection.query('select count(id) as `count` from ?? where `title` = ?', [tables.site, 'title'], function (error, rows) {
        if (rows && rows[0] && rows[0]['count'] > 0) {
            console.log('   skip records...');

            // for async
            done && done();

            // close connection
            connection.destroy();
        } else {
            connection.query('insert into ?? SET ?', [tables.site ,{
                'created_at': new Date(),
                'title': 'title',
                'value': 'simplestrap demo'
            }], function (error, result) {
                console.log(' = Inserted default records...');

                // for async
                done && done(error, result);

                // close connection
                connection.destroy();
            });
        }
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    option: {
        tables: tables,
        core: true
    }
};