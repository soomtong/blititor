var fs = require('fs');
var path = require('path');
var misc = require('../lib/misc');
var mysql = require('mysql');
var winston = require('winston');

var common = require('../lib/common');

//view page for routeTable.admin_root.database_setup
function databaseSetupView(req, res) {
    var params = {

    };

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/setup-database', params);
}

function databaseSetup(req, res) {
    var params = {
        dbHost: req.body['db_host'],
        dbPort: req.body['db_port'] || common.databaseDefault.port,
        dbName: req.body['db_name'],
        dbUserID: req.body['db_user_id'],
        dbUserPassword: req.body['db_user_password']
    };

    var connection = mysql.createConnection({
        host: params.dbHost,
        port: params.dbPort || common.databaseDefault.port,
        database: params.dbName || undefined,
        user: params.dbUserID,
        password: params.dbUserPassword
    });

    connection.connect(function(err) {
        if (err) {
            winston.error('error connecting: ' + err.stack);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-error', params);
        } else {
            // save params to database.json
            var databaseFile = common.databaseDefault.config_file;

            fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

            // load database configuration
            BLITITOR.config.database = require(path.join('../..', databaseFile));

            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-done', params);
        }
        connection.destroy();
    });
}

//view page for routeTable.admin_root.database_init
function databaseInitView(req, res) {
    var params = {

    };

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/setup-database-table', params);
}

function databaseInit(req, res) {
    var params = {
        dbName: req.body['db_name'] || common.databaseDefault.database
    };

    // make database
    var connectionInfo = BLITITOR.config.database;
    console.log(connectionInfo);

    var connection = mysql.createConnection({
        host: connectionInfo.dbHost,
        port: connectionInfo.dbPort || common.databaseDefault.port,
        database: connectionInfo.dbName,
        user: connectionInfo.dbUserID,
        password: connectionInfo.dbUserPassword
    });

    connection.connect(function(err) {
        if (err) {
            winston.error('error connecting: ' + err.stack);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-error', params);
        } else {
            // make database by given name
            var sql = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';
            connection.query(sql, [params.dbName, 'utf8'], function (err, results) {
                BLITITOR.config.database.dbName = params.dbName;

                connection.destroy();

                // if has argument then execute callback
                makeDefaultScheme({});

                res.redirect(res.locals.route.admin_root + res.locals.route.admin.theme_setup);
            });
        }
    });
}

function makeDefaultScheme(options) {
    if (!options) options = { reset: false };

    var databaseConfiguration = BLITITOR.config.database;
    winston.info('== make default scheme. here we go! \n', databaseConfiguration, '\n', common.databaseDefault);

    if (options.reset) {
        deleteScheme(createScheme);
    } else {
        createScheme();
    }
}

function deleteScheme(callback) {
    winston.info('-- drop exist tables --');

    var databaseConfiguration = BLITITOR.config.database;

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
        callback();
    });
}

function createScheme() {
    winston.info('-- make tables if not exist --');

    var databaseConfiguration = BLITITOR.config.database;

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
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup,
    databaseInitView: databaseInitView,
    databaseInit: databaseInit,
    makeDefaultScheme: makeDefaultScheme
};