var fs = require('fs');
var path = require('path');
var database = require('./database');
var databaseDefault = require('./database_default');

var misc = require('../../lib/misc');
var routeTable = misc.routeTable();

// bind common parameters
function exposeParameter(req, res, next) {
    var siteTheme = BLITITOR.config.site.theme;
    var siteThemeType = {
        setup: 'setup',
        admin: 'admin',
        manage: 'manage'
    };

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
    if (BLITITOR.config.database && !BLITITOR.tweak.passDBCheckMiddleware) {
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
                console.log('invalid configuration', err);

                var today = new Date().toISOString().substr(0,10);

                fs.rename(path.join('.', databaseDefault.config_file), path.join('.', databaseDefault.config_file + '.' + today), function (err, data) {
                    BLITITOR.config.database = undefined;
                    res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
                });
            } else {
                if (BLITITOR.config.database.dbName) {
                    // check database status and scheme
                    database.makeDefaultScheme();

                    res.redirect(routeTable.admin_root + routeTable.admin.theme_setup);
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

function passDatabaseInit(req, res, next) {
    if (BLITITOR.config.database && !BLITITOR.tweak.passDBCheckMiddleware) {
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
                    // todo: check this schema if we need
                    database.makeDefaultScheme();

                    res.redirect(routeTable.admin_root + routeTable.admin.theme_setup);
                } else {
                    next();
                }
            }
            connection.destroy();
        });
    } else {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    }
}

module.exports = {
    exposeParameter: exposeParameter,
    checkDatabaseConfiguration: passDatabaseConfig,
    checkDatabaseInitialization: passDatabaseInit,
};