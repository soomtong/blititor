// setup blititor process for command line interface
var prompt = require('prompt');
var clc = require('cli-color');
var async = require('neo-async');
var parseArgs = require('minimist');

var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var database = require('./lib/database');
var theme = require('./lib/theme');
var common = require('./lib/common');
var misc = require('./lib/misc');

var configFile = require('./config/app_default.json').configFile;
var siteDefault = require('./config/site_default.json');

var moduleFile = 'module_list.json';
var params = parseArgs(process.argv.slice(2));
var mainCommand = params._[0];
var subCommand = params._[1];

prompt.message = clc.green(" B");

// todo: refactor for each module's CLI config process, that exposed each
// or just go in to a web interface except these setups.
// register new module then admin get noticed by file system or something others
switch (mainCommand) {
    case 'module':
        loadModuleList();
        break;
    case 'db':
        makeDatabaseConfigFile();
        break;
    case 'db-init':
        if (!subCommand) {
            makeDatabaseTable();
        } else {
            makeModuleDatabaseTable(subCommand);
        }
        break;
    case 'db-reset':
        if (!subCommand) {
            makeDatabaseTableWithReset();
        } else {
            makeModuleDatabaseTableWithReset(subCommand);
        }
        break;
    case 'theme':
        makeThemeConfigFile();
        break;
    case 'admin':
        makeAdminAccount();
        break;
    case 'all':
        var tasks = [loadModuleList, makeDatabaseConfigFile, makeDatabaseTable, makeThemeConfigFile, makeAdminAccount];

        async.series(tasks, function(err, res) {
            console.log(res);
        });

        break;
    default:
        console.log(clc.whiteBright.underline(" = run setup script by each configuration \n"));
        console.log(" > node core/setup module");
        console.log(" > node core/setup db");
        console.log(" > node core/setup db-init [module name]");
        console.log(" or ( > node core/setup db-reset [module name]) for reset table");
        console.log(" > node core/setup theme");
        console.log(" > node core/setup admin \n");
        console.log(clc.whiteBright(" or \n"));
        console.log(" > node core/setup all \n");
}

function makeDatabaseConfigFile(next) {
    console.log(" = Make database configuration \n");

    var databaseDefault = require('./config/database_default.json');

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
                default: databaseDefault.port,
                type: 'integer',
                pattern: /^[0-9]+$/,
                message: 'Port number must be only number',
                required: false
            },
            db_name: {
                description: 'Enter mysql(maria) database name',
                default: databaseDefault.database,
                type: 'string',
                pattern: /^\w+$/,
                message: 'database name must be letters',
                required: false
            },
            db_table_prefix: {
                description: 'Enter mysql(maria) database table prefix',
                default: databaseDefault.prefix,
                type: 'string',
                pattern: /^\w+$/,
                message: 'Prefix must be only letters',
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
        var config = {};

        try {
            config = require(path.join('..', configFile));
        } catch (e) {
            console.log(' = Make new config.json file in root folder...');
            fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
        }

        if(!result){
            return console.log('\n 취소되었습니다.')
        }

        // validate dbTablePrefix (ex. test => b_test_, b_test = b_test_)
        var dbTablePrefix = validateDatabaseTablePrefix(result['db_table_prefix']);

        var params = {
            dbHost: result['db_host'],
            dbPort: result['db_port'] || databaseDefault.port,
            dbName: result['db_name'],
            tablePrefix: dbTablePrefix,
            dbUserID: result['db_user_id'],
            dbUserPassword: result['db_user_password']
        };

        var connection = mysql.createConnection({
            host: params.dbHost,
            port: params.dbPort || databaseDefault.port,
            database: params.dbName || undefined,
            user: params.dbUserID,
            password: params.dbUserPassword
        });

        connection.connect(function(err) {
            console.log(' = Verify database connection...');

            if (err) {
                console.log(' = Verify database connection... Failed'.red);

                console.error('error connecting: ' + err.stack);

                process.exit(1);
            } else {
                // save params to database.json
                config.database = params;

                fs.writeFileSync(configFile, JSON.stringify(config, null, 4));

                console.log(' = Verify configuration data... Done \n');

                // todo: if no database make new one
                database.createDatabase(connection, params.dbName, function (err, result) {
                    console.log(' = Make database... Done \n');
                    connection.destroy();
                    next && next();
                });
            }
        });
    });
}

function makeDatabaseTable(next) {
    console.log(" = Make database tables for blititor \n");

    var connectionInfo = require(path.join('..', configFile))['database'];
    var moduleInfo = require(path.join('..', 'core', 'config', moduleFile));

    var connection = mysql.createConnection({
        host: connectionInfo.dbHost,
        port: connectionInfo.dbPort || common.databaseDefault.port,
        database: connectionInfo.dbName || common.databaseDefault.database,
        user: connectionInfo.dbUserID,
        password: connectionInfo.dbUserPassword
    });

    var iteratorAsync = function (item, callback) {
        if (!item.ignore && item.useDatabase && item.core) {
            console.log('\n = Make database table...', item.folder);

            var moduleName = item.folder;

            makeModuleDatabaseTable(moduleName, function () {
                callback(null, moduleName);
            });
        } else {
            callback();
        }
    };

    database.createDatabase(connection, connectionInfo.dbName, function () {
        // make tables!
        async.mapSeries(moduleInfo, iteratorAsync, function(result){
            console.log(' = Make database tables... Done \n');
            connection.destroy();
            next && next();
        });
    });

}

function makeDatabaseTableWithReset() {
    console.log(" = Reset database tables for blititor \n");

    var connectionInfo = require(path.join('..', configFile))['database'];
    var moduleInfo = require(path.join('..', 'core', 'config', moduleFile));

    var connection = mysql.createConnection({
        host: connectionInfo.dbHost,
        port: connectionInfo.dbPort || common.databaseDefault.port,
        database: connectionInfo.dbName || common.databaseDefault.database,
        user: connectionInfo.dbUserID,
        password: connectionInfo.dbUserPassword
    });

    var iteratorAsync = function (item, callback) {
        if (!item.ignore && item.useDatabase && item.core) {
            var moduleName = item.folder;

            makeModuleDatabaseTableWithReset(moduleName);
        }
        callback(null, moduleName);
    };

    var resultAsync = function (err, result) {
        console.log(' = Make database tables... Done with clean \n');
    };

    database.createDatabase(connection, connectionInfo.dbName, function () {
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
            if (result && result.ask.toUpperCase() == 'YES') {
                // reset tables!
                async.mapSeries(moduleInfo, iteratorAsync, resultAsync);
            } else {
                console.log(' = Make database tables request canceled... \n');
            }

            connection.destroy();
        });
    });
}

function makeModuleDatabaseTable(moduleName, callback) {
    console.log(" = Make database tables for " + '[' + moduleName + ']' + " module");

    var connectionInfo = require(path.join('..', configFile))['database'];
    var module = require('../module/'+ moduleName + '/lib/database');

    // inset dummy data after create table
    module.createScheme(connectionInfo, module.insertDummy, function () {
        callback && callback(null, moduleName);
    });
}

function makeModuleDatabaseTableWithReset(moduleName) {
    console.log(" = Make database tables for " + '[' + moduleName + ']' + " module");

    var connectionInfo = require(path.join('..', configFile))['database'];
    var module = require('../module/'+ moduleName + '/lib/database');

    // delete scheme before create table
    module.deleteScheme(connectionInfo, module.createScheme);
}

function makeThemeConfigFile(next) {
    console.log(" = Make Theme configuration \n");

    var config = {};

    try {
        config = require(path.join('..', configFile));
    } catch (e) {
        console.log(' = Make new config.json file in root folder...');
        fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
    }

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
                    default: themeList.length,
                    type: 'integer',
                    pattern: /^[0-9]+$/,
                    message: 'Port number must be only number',
                    required: true
                }
            }
        };

        prompt.get(configScheme, function (err, result) {
            // console.log(result, themeList[result.ask - 1].folderName);
            if(!result){
                return console.log('\n 취소되었습니다.')
            }
            var themeData = {
                "appTheme": themeList[result.ask - 1].folderName || "simplestrap",
                "siteTheme": themeList[result.ask - 1].folderName || "simplestrap",
                "adminTheme": themeList[result.ask - 1].folderName || "simplestrap",
                "manageTheme": themeList[result.ask - 1].folderName || "simplestrap"
            };

            if (!config.application) {
                config.application = {
                    "port": siteDefault.port,
                    "appName": themeData.appTheme,
                    "url_prefix": siteDefault.url_prefix,
                    "title": siteDefault.title
                }
            } else {
                config.application.appName = themeData.appTheme;
            }

            config.theme = {
                "siteTheme": themeData.siteTheme,
                "adminTheme": themeData.adminTheme,
                "manageTheme": themeData.manageTheme
            };

            fs.writeFileSync(configFile, JSON.stringify(config, null, 4));

            next && next();
        });
    });
}

function makeAdminAccount() {
    console.log(" = Make Administrator account \n");

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
        if(!result){
            return console.log('\n 취소되었습니다.')
        }
        var query = require('../module/account/lib/query');
        var hash = common.hash(result.password);
        var tables = require('../module/account/lib/database').option.tables;
        var authData = {
            user_id: result.id,
            user_password: hash
        };

        // save administrator account to user table
        var connectionInfo = require(path.join('..', configFile))['database'];

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
                console.log(' = Make administrator account...');

                // make database by given name
                connection.query(query.insertInto, [tables.auth, authData], function (err, result) {
                    if (err) {
                        console.log(' = 관리자 로그인 정보 저장에 실패했습니다.'.red);
                        console.log(' = ' + authData.user_id + ' 은 이미 존재합니다.');
                        
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
                        grant: 'AMC',
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

function loadModuleList(next) {
    console.log(" = Gathering Modules Info for Database \n");

    // generate module list
    var folderName = 'module';

    function collectData(item, callback) {
        var moduleData = {
            folder: item,
            useDatabase: true,
            ignore: false
        };

        console.log(' = Gathering...', item);

        fs.stat(path.join('.', folderName, item, 'lib', 'database.js'), function (err, stat) {
            if (err) {
                moduleData.useDatabase = false;
            } else {
                var module = require(path.join('..', folderName, item, 'lib', 'database.js'));

                if (module.option && module.option.tables) {
                    moduleData.tables = module.option.tables || {};
                    moduleData.core = module.option.core || false;
                } else {
                    moduleData.useDatabase = false;
                    moduleData.tables = {};
                    moduleData.core = false;
                }
            }

            callback(null, moduleData);
        });
    }

    fs.readdir(path.join('.', folderName), function (err, files) {
        async.map(files, collectData, function (err, results) {
            console.log(' = Module Data Gathering... Done \n');

            // ordering. first is site, second is account
            var temp = [];

            results.filter(function (item, index) {
                if (item.folder == 'site') {
                    temp.push(item);
                    results.splice(index, 1);
                }
            });

            results.filter(function (item, index) {
                if (item.folder == 'account') {
                    temp.push(item);
                    results.splice(index, 1);
                }
            });

            var ordered = temp.concat(results);

            fs.writeFileSync(path.join('core', 'config', 'module_list.json'), JSON.stringify(ordered, null, 4));
            next && next();
        });
    });
}

function validateDatabaseTablePrefix(prefix) {
    if (!prefix.startsWith("b_")) {
        if (prefix.startsWith("_")) {
            prefix = 'b' + prefix;
        } else {
            prefix = 'b_' + prefix;
        }
    }

    if (!prefix.endsWith("_")) {
        prefix += '_';
    }

    return prefix;
}
