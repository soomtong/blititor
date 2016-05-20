var mysql = require('mysql');
var winston = require('winston');

var common = require('../lib/common');

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tables = [[common.tables.point, common.tables.user, common.tables.auth, common.tables.site]];

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

    var sql_site = 'CREATE TABLE IF NOT EXISTS `site` ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`title` varchar(64), `value` varchar(256), ' +
        '`created_at` datetime)';
    var sql_auth = 'CREATE TABLE IF NOT EXISTS `auth` ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` varchar(64) not null, `user_password` varchar(255) not null, ' +
        'UNIQUE auth_user_id_unique(`user_id`))';
    var sql_user = 'CREATE TABLE IF NOT EXISTS `user` ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`uuid` char(36) not null, `auth_id` int unsigned not null, ' +
        '`nickname` varchar(64), `level` varchar(1), `grant` varchar(1), ' +
        '`photo` varchar(255), `point` int, ' +
        '`login_counter` int, `logout_counter` int, ' +
        '`desc` text, ' +
        '`last_logged_at` datetime, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'UNIQUE user_uuid_unique(`uuid`), ' +
        'INDEX auth_id(`auth_id`))';
    var sql_point = 'CREATE TABLE IF NOT EXISTS `point` ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` int unsigned not null, `amount` int, `reason` varchar(255), ' +
        '`created_at` datetime, INDEX user_id(`user_id`))';

    var sql_fkey_user_auth = 'alter table `user` ' +
        'add constraint user_auth_id_foreign foreign key (`auth_id`) ' +
        'references `auth` (`id`)';
    var sql_fkey_point_user = 'alter table `point` ' +
        'add constraint point_user_id_foreign foreign key (`user_id`) ' +
        'references `user` (`id`)';

    connection.query(sql_site, function (error, result) {
        connection.query(sql_auth, function (error, result) {
            connection.query(sql_user, function (error, result) {
                connection.query(sql_point, function (error, result) {
                    // bind foreign key
                    connection.query(sql_fkey_user_auth, function (error, result) {
                        connection.query(sql_fkey_point_user, function (error, result) {
                            connection.query('insert into `site` SET ?', {
                                'created_at': new Date(),
                                'title': 'title',
                                'value': 'simplestrap demo'
                            }, function (error, result) {
                                // close connection
                                connection.destroy();
                            });

                        })
                    })
                });
            });
        });
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme
};