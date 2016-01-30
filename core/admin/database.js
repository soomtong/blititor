var fs = require('fs');
var misc = require('../../lib/misc');

var routeTable = misc.routeTable();

// view page
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
        dbPort: req.body['db_port'] || 3306,
        dbName: req.body['db_name'],
        dbUserID: req.body['db_user_id'],
        dbUserPassword: req.body['db_user_password']
    };

    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: params.dbHost,
        port: params.dbPort || 3306,
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
            var databaseFile = BLITITOR.db_config_file;

            fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

            //console.log('connected as id ' + connection.threadId);

            res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/partial/setup-database-done', params);
        }
        connection.destroy();
    });
}

function databaseInitView(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/init-database', params);
}

function makeDatabase() {

}

function makeSchema() {
    var databaseConfiguration = BLITITOR.config.database;
    var knex = require('knex');
    var connection = knex({
        client: 'mysql',
        connection: {
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || 3306,
            database: databaseConfiguration.dbName || 'db_blititor',
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        }
    });

    connection.schema.createTableIfNotExists('users', function (table) {
        console.log('table', table);
        table.increments();
        table.string('name');
        table.timestamps();

        //connection.destroy();
    });
}

module.exports = {
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup,
    databaseInitView: databaseInitView,
    makeDatabase: makeDatabase,
    makeSchema: makeSchema
};