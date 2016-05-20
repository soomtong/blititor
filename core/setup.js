// setup blititor process for command line interface
/*
blititor> node core/setup

or

blititor> node core/setup all

is equals

blititor> node core/setup config
blititor> node core/setup init
blititor> node core/setup template
*/

var params = process.argv[2];

var prompt = require('prompt');
var colors = require('colors');
var async = require('neo-async');

var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var common = require('./lib/common');

prompt.message = colors.green("Blititor");

switch (params) {
    case 'config':
        makeDatabaseConfigFile();
        break;
    case 'init':
        makeDatabaseTable();
        break;
    case 'template':
        makeThemeConfigFile();
        makeThemeTemplage();
        break;
    case 'all':
    default:
        makeDatabaseConfigFile();
        makeDatabaseTable();
        makeThemeConfigFile();
        makeThemeTemplage();
}

function makeDatabaseConfigFile() {
    console.log(" = Make database configuration".rainbow);

    prompt.start();

    var configScheme = {
        properties: {
            db_host: {
                description: 'Enter mysql(maria) host',
                type: 'string',
                pattern: /^(?!(https?:\/\/))\w+.+$/,
                message: 'Host name must be only letters',
                required: true
            },
            db_port: {
                description: 'Enter mysql(maria) port',
                default: '3306',
                type: 'integer',
                pattern: /^[0-9]+$/,
                message: 'Port number must be only number',
                required: false
            },
            db_name: {
                description: 'Enter mysql(maria) database name',
                default: 'db_blititor',
                type: 'string',
                pattern: /^\w+$/,
                message: 'database name must be letters',
                required: false
            },
            db_user_id: {
                description: 'Enter mysql(maria) user name',
                type: 'string',
                pattern: /^\w+$/,
                message: 'Host name must be only letters',
                required: true
            },
            db_user_password: {
                description: 'Enter your password',
                type: 'string',
                message: 'Password must be letters',
                hidden: true,
                replace: '*',
                required: true
            }
        }
    };

    prompt.get(configScheme, function (err, result) {
        var params = {
            dbHost: result['db_host'],
            dbPort: result['db_port'] || common.databaseDefault.port,
            dbName: result['db_name'],
            dbUserID: result['db_user_id'],
            dbUserPassword: result['db_user_password']
        };

        var connection = mysql.createConnection({
            host: params.dbHost,
            port: params.dbPort || common.databaseDefault.port,
            database: params.dbName || undefined,
            user: params.dbUserID,
            password: params.dbUserPassword
        });

        connection.connect(function(err) {
            console.log(' = Verify configuration data...'.blue);

            if (err) {
                console.log(' = Verify configuration data... Failed'.red);

                console.error('error connecting: ' + err.stack);
            } else {
                // save params to database.json
                var databaseFile = common.databaseDefault.config_file;

                fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

                console.log(' = Verify configuration data... Done'.green);
            }
            
            connection.destroy();
        });
    });
}

function makeDatabaseTable() {

}

function makeThemeConfigFile() {

}

function makeThemeTemplage() {

}