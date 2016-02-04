var fs = require('fs');
var misc = require('../../lib/misc');
var mysql = require('mysql');
var knex = require('knex');

var databaseDefault = require('./database_default');

var routeTable = misc.routeTable();

//view page for routeTable.admin_root.database_setup
function databaseSetupView(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/setup-database', params);
}

function databaseSetup(req, res) {
    var params = {
        dbHost: req.body['db_host'],
        dbPort: req.body['db_port'] || databaseDefault.port,
        dbName: req.body['db_name'],
        dbUserID: req.body['db_user_id'],
        dbUserPassword: req.body['db_user_password']
    };

    var connection = mysql.createConnection({
        host: params.dbHost,
        port: params.dbPort || databaseDefault.port,
        database: params.dbName || undefined,
        user: params.dbUserID,
        password: params.dbUserPassword
    });

    //console.log(connection);

    connection.connect(function(err) {
        if (err) {
            //console.error('error connecting: ' + err.stack);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-error', params);
        } else {
            // save params to database.json
            var databaseFile = databaseDefault.config_file;

            fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

            //console.log('connected as id ' + connection.threadId);

            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-done', params);
        }
        connection.destroy();
    });
}

//view page for routeTable.admin_root.database_init
function databaseInitView(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/init-database', params);
}

function databaseInit(req, res) {
    var params = {
        dbName: req.body['db_name'] || databaseDefault.database
    };

    // make database
    var connectionInfo = BLITITOR.config.database;

    var connection = mysql.createConnection({
        host: connectionInfo.dbHost,
        port: connectionInfo.dbPort || databaseDefault.port,
        database: connectionInfo.dbName || undefined,
        user: connectionInfo.dbUserID,
        password: connectionInfo.dbUserPassword
    });

    //console.log(connection);

    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-error', params);
        } else {
            // make database by given name
            var sql = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';
            connection.query(sql, [params.dbName, 'utf8'], function (err, results) {
                BLITITOR.config.database.dbName = params.dbName;

                connection.destroy();

                // if has argument then execute callback
                makeDefaultScheme();

                res.redirect('/');
            });
        }
    });
}

function makeDefaultScheme() {
    var databaseConfiguration = BLITITOR.config.database;
    console.log('== make default scheme. here we go!', databaseConfiguration);

    var connection = knex({
        client: 'mysql',
        connection: {
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || databaseDefault.port,
            database: databaseConfiguration.dbName || databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        }
    });

    connection.schema.createTableIfNotExists('users', function (table) {
        table.increments();
        table.string('name');
        table.timestamps();
    }).then(function (err, results) {
        connection.destroy();
    });
}

module.exports = {
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup,
    databaseInitView: databaseInitView,
    databaseInit: databaseInit,
    makeDefaultScheme: makeDefaultScheme
};