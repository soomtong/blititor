var fs = require('fs');
var path = require('path');
var winston = require('winston');

var database = require('./database');
var databaseDefault = require('./../config/database_default');

var misc = require('../lib/misc');
var routeTable = misc.routeTable();
var siteThemeType = misc.siteThemeType();

// bind common parameters
function exposeParameter(req, res, next) {
    res.locals.site = {
        theme: BLITITOR.config.site.theme,
        themeType: siteThemeType,
        title: BLITITOR.config.revision,
        url: routeTable.admin_root + req.path
    };
    res.locals.route = routeTable;

    console.log('bind locals middleware in admin: {site, route}');
    next();
}

function passDatabaseConfig(req, res, next) {
    if (BLITITOR.tweak.passDBCheckMiddleware) return next();

    if (BLITITOR.config.database) {
/*
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
            console.log('pass db config');
            if (err) {
                winston.log('invalid configuration', err);

                var today = new Date().toISOString().substr(0,10);

                connection.destroy();

                fs.rename(path.join('.', databaseDefault.config_file), path.join('.', databaseDefault.config_file + '.' + today), function (err, data) {
                    BLITITOR.config.database = undefined;

                    res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
                });

            } else {
                /!*if (BLITITOR.config.database.dbName) {
                    // check database status and scheme
                    // database.makeDefaultScheme();

                    res.redirect(routeTable.admin_root + routeTable.admin.theme_setup);
                } else {
                    res.redirect(routeTable.admin_root + routeTable.admin.database_init);
                }*!/
                connection.destroy();

                next();
            }
        });
*/
        res.redirect(routeTable.admin_root + routeTable.admin.database_init);

    } else {
        next();
    }
}

function passDatabaseInit(req, res, next) {
    if (BLITITOR.tweak.passDBCheckMiddleware) return next();

    if (!BLITITOR.config.database) {
/*
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
            console.log('pass db init');
            if (err) {
                winston.error("database connection failed. then move to re-make config file");
                res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
            } else {
                next();
            }
            connection.destroy();
        });
*/
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);

    } else {
        next();
    }
}
module.exports = {
    exposeLocals: exposeParameter,
    checkDatabaseConfiguration: passDatabaseConfig,
    checkDatabaseInitialization: passDatabaseInit,
};