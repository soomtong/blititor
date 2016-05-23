// setup blititor process for command line interface
var params = process.argv[2];

var prompt = require('prompt');
var colors = require('colors');
var async = require('neo-async');

var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var database = require('./admin/database');
var theme = require('./admin/theme');
var common = require('./lib/common');

var databaseFile = common.databaseDefault['config_file'];

prompt.message = colors.green(" B");

switch (params) {
    case 'config':
        makeDatabaseConfigFile();
        break;
    case 'init':
        makeDatabaseTable();
        break;
    case 'reset':
        makeDatabaseTable({reset: true});
        break;
    case 'theme':
        makeThemeConfigFile();
        break;
    case 'template':
        makeThemeTemplate();
        break;
    case 'all':
    default:
        var tasks = [makeDatabaseConfigFile, makeDatabaseTable, makeThemeConfigFile, makeThemeTemplate];

        async.series(tasks, function(err, res) {
            console.log(res); // [1, 2, 3, 4];
            console.log(order); // [1, 2, 3, 4]
        });
}

function makeDatabaseConfigFile(done) {
    console.log(" = Make database configuration \n".rainbow);

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

                fs.writeFileSync(databaseFile, JSON.stringify(params, null, 4) + '\n');

                console.log(' = Verify configuration data... Done \n'.green);
            }

            connection.destroy();

            if (done && typeof done === 'function') done(null, 'step 1 callback');
        });
    });
}

function makeDatabaseTable(done) {
    var reset = false;

    if (done && typeof done !== 'function') {
        reset = done.reset;
    }
    
    console.log(" = Make database tables for blititor \n".rainbow);

    var connectionInfo = require(path.join('..', databaseFile));

    var connection = mysql.createConnection({
        host: connectionInfo.dbHost,
        port: connectionInfo.dbPort || common.databaseDefault.port,
        database: connectionInfo.dbName || common.databaseDefault.database,
        user: connectionInfo.dbUserID,
        password: connectionInfo.dbUserPassword
    });

    connection.connect(function(err) {
        console.log(' = Verify connection parameters...'.blue);

        if (err) {
            console.log(' = Verify connection parameters... Failed'.red);

            connection.destroy();

            console.error('error connecting: ' + err.stack);
        } else {
            console.log(' = Make database tables...'.blue);

            // make database by given name
            var sql = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';
            connection.query(sql, [connectionInfo.dbName, 'utf8'], function (err, results) {
                connection.destroy();

                // if has argument then execute callback
                if (reset) {
                    prompt.start();

                    console.log('');

                    var configScheme = {
                        properties: {
                            ask: {
                                description: "It'll delete all your data in blititor tables, Input YES if you are Sure",
                                type: 'string',
                                pattern: /^[yesYESnoNO]+$/,
                                message: 'Host name must be yes or YES',
                                required: true
                            }
                        }
                    };

                    prompt.get(configScheme, function (err, result) {
                        if (result.ask.toUpperCase() == 'YES') {
                            database.deleteScheme(connectionInfo, database.createScheme);

                            console.log(' = Make database tables... Done with clean \n'.green);
                        } else {
                            console.log(' = Make database tables request canceled... \n'.green);
                        }
                    });
                } else {
                    database.createScheme(connectionInfo);

                    console.log(' = Make database tables... Done \n'.green);
                }

                if (done && typeof done === 'function') done(null, 'step 2 callback');
            });
        }
    });
}

function makeThemeConfigFile() {
    console.log(" = Make Theme configuration \n".rainbow);

    theme.getThemeList('theme', function (themeList) {
        console.log('');

        prompt.start();

        var description = themeList.map(function (item, idx) {
            return "\n " + (idx + 1) + ". " +
                (item.description.title || '무제') +
                "(" + (item.folderName || '') + ")\n" +
                (item.description.quote || '설명이 없습니다.') + "\n" +
                (item.description.credit || '제작자 불분명');
        });

        var configScheme = {
            properties: {
                ask: {
                    description: "테마를 골라주세요...".white + description.join('\n') + "\n 선택".green,
                    default: '3',
                    type: 'integer',
                    pattern: /^[0-9]+$/,
                    message: 'Port number must be only number',
                    required: true
                }
            }
        };

        prompt.get(configScheme, function (err, result) {
            console.log(result);
            
            
        });
    });
}

function makeThemeTemplate() {

}