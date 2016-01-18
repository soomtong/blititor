var fs = require('fs');
var misc = require('../../lib/misc');

var routeTable = misc.routeTable();

// view page
function databaseSetupView(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/setup-database', params);
}

function databaseSetup(req, res) {
    var params = {
        dbHost: req.body['db_host'],
        dbPort: req.body['db_port'] || 3306,
        dbName: req.body['db_name'],
        dbUserID: req.body['db_user_id'],
        dbUserPassword: req.body['db_user_password']
    };

    //console.log('result from client', req.body);
    var mysql      = require('mysql');
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
            console.error('error connecting: ' + err.stack);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/partial/setup-database-error', params);

        } else {
            // save params to database.json
            var databaseFile = BLITITOR.db_config_file;

            fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

            //console.log('connected as id ' + connection.threadId);
            res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/partial/setup-database-done', params);
        }
    });
}
module.exports = {
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup
};