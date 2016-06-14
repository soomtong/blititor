// setup blititor process for command line interface
var param1 = process.argv[2];
var param2 = process.argv[3] || '';

var prompt = require('prompt');
var colors = require('colors');
var async = require('neo-async');

var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var database = require('./admin/database');
var theme = require('./admin/theme');
var common = require('./lib/common');
var misc = require('./lib/misc');

var tables = misc.databaseTable();

var databaseFile = common.databaseDefault['config_file'];

prompt.message = colors.green(" B");

// todo: refactor for each module's CLI config process, that exposed each
// or just go in to a web interface except these setups.
// register new module then admin get noticed by file system or something others
switch (param1) {
    case 'config':
        makeDatabaseConfigFile();
        break;
    case 'module':
        // load all modules then save module config file to `config/module_list.json`
        // modify this module_list.json to configure this web site
        loadModuleList();        
        break;
    case 'init':
        switch (param2) {
            case 'guestbook':
                makeModuleDatabaseTable(param2);
                break;
            default:
                makeDefaultDatabaseTable();
        }
        break;
    case 'reset':
        switch (param2) {
            case 'guestbook':
                makeModuleDatabaseTable(param2, {reset: true});
                break;
            default:
                makeDefaultDatabaseTable({reset: true});
        }
        break;
    case 'theme':
        makeThemeConfigFile();
        break;
    case 'template':
        makeThemeTemplate();
        break;
    case 'admin':
        makeAdminAccount();
        break;
    case 'all':
        var tasks = [makeDatabaseConfigFile, makeDefaultDatabaseTable, makeThemeConfigFile, makeThemeTemplate, makeAdminAccount];

        async.series(tasks, function(err, res) {
            console.log(res);
        });

        break;
    default:
        console.log(" = run setup script by each configuration \n".rainbow);
        console.log(" > node core/setup config".white);
        console.log(" > node core/setup init".white);
        console.log(" or ( > node core/setup reset ) for reset".white);
        console.log(" > node core/setup theme".white);
        console.log(" > node core/setup template".white);
        console.log(" > node core/setup admin \n".white);
        console.log(" or \n".gray);
        console.log(" > node core/setup all \n".white);
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
            // database: params.dbName || undefined,
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

                database.createDatabase(connection, params.dbName);
            }

            if (done && typeof done === 'function') done(null, 'step 1 callback');
        });
    });
}

function makeDefaultDatabaseTable(done) {
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

function makeModuleDatabaseTable(moduleName, option) {
    console.log(" = Make database tables for " + moduleName + " module \n".rainbow);

    var connectionInfo = require(path.join('..', databaseFile));

    var module = require('../module/'+ moduleName + '/lib/database');

    module.createScheme(connectionInfo);
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
            console.log(result, themeList[result.ask - 1].folderName);

            var themeData = {
                "setupTheme": "simplestrap",
                "adminTheme": "simplestrap",
                "manageTheme": "simplestrap",
                "siteTheme": themeList[result.ask - 1].folderName || "simplestrap"
            };

            fs.writeFileSync('theme.json', JSON.stringify(themeData, null, 4));

        });
    });
}

function makeThemeTemplate() {
    console.log(" = Make Theme template data \n".rainbow);

    // load theme config file

    // load theme data from sql text

    // prompt action

    // dump theme data to database

}

function makeAdminAccount() {
    console.log(" = Make Administrator account \n".rainbow);

    // prompt id and password
    prompt.start();

    var configScheme = {
        properties: {
            id: {
                description: "관리자 아이디를 입력해주세요... (E-Mail 형태를 사용합니다.)".white,
                default: 'admin@blititor.com',
                type: 'string',
                message: 'Password must be letters',
                required: true
            },
            password: {
                description: 'Enter administrator password',
                type: 'string',
                message: 'Password must be letters',
                hidden: true,
                replace: '*',
                required: true
            }
        }
    };

    prompt.get(configScheme, function (err, result) {
        var query = require('../module/account/lib/query');

        var hash = common.hash(result.password);

        var authData = {
            user_id: result.id,
            user_password: hash
        };

        // save administrator account to user table
        var connectionInfo = require(path.join('..', databaseFile));

        var connection = mysql.createConnection({
            host: connectionInfo.dbHost,
            port: connectionInfo.dbPort || common.databaseDefault.port,
            database: connectionInfo.dbName || common.databaseDefault.database,
            user: connectionInfo.dbUserID,
            password: connectionInfo.dbUserPassword
        });

        connection.connect(function (error) {
            if (error) {
                console.log(' = Verify connection parameters... Failed'.red);

                connection.destroy();

                console.error('error connecting: ' + err.stack);
            } else {
                console.log(' = Make administrator account...'.blue);

                // make database by given name
                connection.query(query.insertInto, [tables.auth, authData], function (err, result) {
                    if (err) {
                        console.log(' = 관리자 로그인 정보 저장에 실패했습니다.'.red);

                        connection.destroy();

                        return;
                    }

                    var auth_id = result['insertId'];

                    console.log(' = New Auth ID Generated...', auth_id);

                    // save to user table
                    var userData = {
                        uuid: common.UUID4(),
                        auth_id: auth_id,
                        nickname: '관리자',
                        level: 9,
                        grant: 'A',
                        login_counter: 1,
                        last_logged_at: new Date(),
                        created_at: new Date()
                    };

                    connection.query(query.insertInto, [tables.user, userData], function (err, result) {
                        if (err) {
                            console.log(' = 관리자 계정 정보 저장에 실패했습니다.'.red);

                            connection.destroy();

                            return;
                        }

                        var id = result['insertId'];

                        console.log(' = New User ID Generated...', id);

                        connection.destroy();
                    });
                });
            }
        });
    });
}

function loadModuleList() {
    // generate module list
    var folderName = 'module';

    function collectData(item, callback) {
        var moduleData = {
            folder: item,
            useDatabase: true,
            ignore: true
        };

        fs.stat(path.join('.', folderName, item, 'lib', 'database.js'), function (err, stat) {
            if (err) {
                moduleData.useDatabase = false;
            } else {
                moduleData.tables = require(path.join('..', folderName, item, 'lib', 'database.js')).tables || {};
            }

            callback(null, moduleData);
        });
    }

    fs.readdir(path.join('.', folderName), function (err, files) {
        async.map(files, collectData, function (err, results) {
            // console.log(results);
            fs.writeFileSync(path.join('core', 'config', 'module_list.json'), JSON.stringify(results, null, 4));
        });
    });
}