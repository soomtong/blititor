var fs = require('fs');
var misc = require('../misc');
var mysql = require('mysql');
var knex = require('knex');
var winston = require('winston');

var common = require('../../lib/common');

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

    var connection = knex({
        debug: true,
        client: 'mysql',
        connection: {
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || common.databaseDefault.port,
            database: databaseConfiguration.dbName || common.databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        }
    });

    if (options.reset) {
        deleteScheme(connection, createScheme);
    } else {
        createScheme(connection, options.reset);
    }
}

function deleteScheme(connection, callback) {
    winston.info('-- drop exist tables --');

    connection.schema
        .dropTableIfExists(common.tables.point)
        .dropTableIfExists(common.tables.user)
        .dropTableIfExists(common.tables.auth)
        .dropTableIfExists(common.tables.site)
        .then(function (error, results) {
            callback(connection, true);
        })
        .catch(function (error) {
            winston.error(error);
            connection.destroy();
        });
}

function createScheme(connection, reset) {
    winston.info('-- make tables if not exist --');

    connection.schema
        .createTableIfNotExists(common.tables.site, siteTable)
        .createTableIfNotExists(common.tables.auth, authTable)
        .createTableIfNotExists(common.tables.user, userTable)
        .createTableIfNotExists(common.tables.point, pointTable)
        .then(function (result) {
            winston.info(result);

            connection
                .insert({
                    title: "simplestrap demo",
                    created_at: new Date()
                }, 'id')
                .into('site')
                .then(function (id) {
                    winston.info('inserted new site id:', id[0]);

                    // bind new site id to GLOBAL
                    if (reset) {

                    } else {
                        BLITITOR.config.site.id = id;
                    }

                    connection.destroy();
                })
                .catch(function (error) {
                    winston.error('insert new site id failed', error);

                    connection.destroy();
                });
        })
        .catch(function (error) {
            winston.error(error);
            connection.destroy();
        });
}


/* table specs */
function siteTable(table) {
    winston.info('make table', common.tables.site);
    table.increments();
    table.string('title', 64);
    table.string('icon');
    table.string('start_page', 128);
    table.string('layout', 128);
    table.text('desc');
    table.dateTime('created_at');
}

function authTable(table) {
    winston.info('make table', common.tables.auth);
    table.increments();
    table.string('user_id', 64).unique().notNullable();
    table.string('user_password').notNullable();
}

function userTable(table) {
    winston.info('make table', common.tables.user);
    table.increments();
    table.uuid('uuid').unique().notNullable();
    table.integer('site_id').index('site_id').unsigned().notNullable().references('id').inTable(common.tables.site);
    table.integer('auth_id').index('auth_id').unsigned().notNullable().references('id').inTable(common.tables.auth);
    table.string('nickname', 64);
    table.string('level', 1);   // site admin: A, site manager: M, content manager: C and user level 1 to 9
    table.string('photo');
    table.integer('point');
    table.integer('login_counter');
    table.integer('logout_counter');
    table.text('desc');
    table.dateTime('last_logged_at');
    table.timestamps();
}

function pointTable(table) {
    winston.info('make table', common.tables.point);
    table.increments();
    table.integer('site_id').index('site_id').unsigned().notNullable().references('id').inTable(common.tables.site);
    table.integer('user_id').index('user_id').unsigned().notNullable().references('id').inTable(common.tables.user);
    table.integer('amount');
    table.string('reason');
    table.dateTime('created_at');
}

/*
function createIndex(connection) {
    winston.info('make index');
    connection.schema.table(common.tables.user, function (table) {
        table.dropIndex('user_uuid').index('user_uuid');
        table.dropIndex('user_id').index('user_id');
        //table.dropForeign('site_id').foreign('site_id').references('id').inTable(common.tables.site);
    }).then(function (error, results) {
        winston.info(results);
    }).catch(function (error) {
        winston.error(common.tables.user, 'indexing', error);
    });
    connection.schema.table(common.tables.point, function (table) {
        table.dropIndex('site_id').index('site_id');
        table.dropIndex('user_uuid').index('user_uuid');
        //table.dropForeign('user_id').foreign('user_id').references('id').inTable(common.tables.user);
    }).then(function (error, results) {
        winston.info(results);
    }).catch(function (error) {
        winston.error(common.tables.point, 'indexing', error);
    });
}
*/

module.exports = {
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup,
    databaseInitView: databaseInitView,
    databaseInit: databaseInit,
    makeDefaultScheme: makeDefaultScheme
};