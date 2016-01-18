var database = require('./database');

var misc = require('../../lib/misc');
var routeTable = misc.routeTable();

// bind common parameters
function exposeParameter(req, res, next) {
    var siteTheme = BLITITOR.config.site.theme;
    var siteThemeType = 'setup';

    res.locals.site = {
        theme: siteTheme,
        themeType: siteThemeType,
        title: BLITITOR.config.revision,
        url: routeTable.admin_root + req.path
    };
    res.locals.route = routeTable;

    next();
}

function passDatabaseConfig(req, res, next) {
    if (BLITITOR.config.database) {
        var databaseConfiguration = BLITITOR.config.database;
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || 3306,
            database: databaseConfiguration.dbName,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        });

        connection.connect(function(err) {
            if (err) {
                res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
            } else {
                if (BLITITOR.config.database.dbName) {
                    // check schema
                    database.makeDatabase();
                    database.makeSchema();

                    res.redirect(routeTable.admin_root);
                } else {
                    res.redirect(routeTable.admin_root + routeTable.admin.database_init);
                }
            }
            connection.destroy();
        });
    } else {
        next();
    }
}


module.exports = {
    exposeParameter: exposeParameter,
    checkDatabaseConfiguration: passDatabaseConfig,
};