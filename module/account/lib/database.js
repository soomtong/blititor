var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    user: common.databaseDefault.prefix + 'user',
    auth: common.databaseDefault.prefix + 'auth',
    point: common.databaseDefault.prefix + 'point'
};

var query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.point, tables.user, tables.auth];

    connection.query(sql, [tableList], function (error, results, fields) {
        connection.destroy();
        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql_auth = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` varchar(64) not null, `user_password` varchar(255) not null, ' +
        'UNIQUE auth_user_id_unique(`user_id`))';
    var sql_user = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`uuid` char(36) not null, `auth_id` int unsigned not null, ' +
        '`nickname` varchar(64), `level` varchar(3), `grant` varchar(3), ' +
        '`status` varchar(1), `photo` varchar(255), `point` int, ' +
        '`login_counter` int unsigned, `logout_counter` int unsigned, ' +
        '`desc` text, ' +
        '`last_logged_at` datetime, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'UNIQUE user_uuid_unique(`uuid`), ' +
        'INDEX auth_id(`auth_id`))';
    var sql_point = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` int unsigned not null, `amount` int, `reason` varchar(255), ' +
        '`created_at` datetime, ' +
        'INDEX user_id(`user_id`))';

    var sql_fkey_user_auth = 'alter table ?? ' +
        'add constraint user_auth_id_foreign foreign key (`auth_id`) ' +
        'references ?? (`id`)';
    var sql_fkey_point_user = 'alter table ?? ' +
        'add constraint point_user_id_foreign foreign key (`user_id`) ' +
        'references ?? (`id`)';

    connection.query(sql_auth, tables.auth, function (error, result) {
        connection.query(sql_user, tables.user, function (error, result) {
            connection.query(sql_point, tables.point, function (error, result) {
                // bind foreign key
                connection.query(sql_fkey_user_auth, [tables.user, tables.auth], function (error, result) {
                    connection.query(sql_fkey_point_user, [tables.point, tables.user], function (error, result) {
                        // for dummy
                        callback && callback(databaseConfiguration, done);

                        connection.destroy();
                    })
                })
            });
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy.json');
            var iteratorAsync = function (item, callback) {
                var authData = {
                    user_id: item.email,
                    user_password: item.password
                };
                var userData = {
                    uuid: common.UUID4(),
                    auth_id: null,
                    nickname: item.nickname,
                    level: 1,
                    grant: '',
                    login_counter: 0,
                    last_logged_at: null,
                    created_at: new Date()
                };

                insertDummyAccount(connection, authData, userData, function (err, result) {
                    console.log('   inserted records...'.white);

                    callback(err, result);
                });
            };
            var resultAsync = function (err, result) {
                console.log(' = Inserted default records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });
}

function insertDummyAccount(connection, authData, userData, callback) {
    insertAuth(connection, authData, function (err, result) {
        if (err) {
            console.log(' = 로그인 정보 저장에 실패했습니다.'.red);

            callback(null, result);

            return;
        }

        var auth_id = result['insertId'];

        console.log(' = New Auth ID Generated...', auth_id);

        // save to user table
        userData.auth_id = auth_id;
        userData.created_at = new Date();

        insertAccount(connection, userData, function (err, result) {
            if (err) {
                console.log(' = 계정 정보 저장에 실패했습니다.'.red);

                callback(null, result);

                return;
            }

            var id = result['insertId'];

            console.log(' = New User ID Generated...', id);

            callback(err, result);
        });
    });
}

function selectByID(connection, id, callback) {
    var field = ["id", "uuid", "nickname", "photo", "level", "grant", "login_counter"];

    connection.query(query.selectByID, [field, tables.user, id], function (err, rows) {
        callback(err, rows[0]);
    });
}

function selectByUUID(connection, uuid, callback) {
    var field = ['id', 'uuid', 'nickname', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at'];

    connection.query(query.selectByUUID, [field, tables.user, uuid], function (err, rows) {
        callback(err, rows[0]);
    });
}

function selectByAuthID(connection, authID, callback) {
    var field = ['id', 'uuid', 'nickname', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at'];

    connection.query(query.selectByAuthID, [field, tables.user, authID], function (err, rows) {
        callback(err, rows[0]);
    });
}

function selectByNickname(connection, nickname, callback) {
    var field = ['id', 'uuid', 'nickname', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at'];

    connection.query(query.selectByUUID, [field, tables.user, nickname], function (err, rows) {
        callback(err, rows[0]);
    });
}

function selectByUserID(connection, userID, callback) {
    var field = ['id', 'user_id', 'user_password'];

    connection.query(query.selectByUserID, [field, tables.auth, userID], function (err, rows) {
        callback(err, rows[0]);
    });
}

function insertAuth(connection, authData, callback) {
    connection.query(query.insertInto, [tables.auth, authData], function (err, result) {
        callback(err, result);
    });
}

function insertAccount(connection, userData, callback) {
    connection.query(query.insertInto, [tables.user, userData], function (err, result) {
        callback(err, result);
    });
}

function selectAuthIDByUUID(connection, UUID, callback) {
    connection.query(query.selectByUUID, ['auth_id', tables.user, UUID], function (err, rows) {
        callback(err, rows[0]);
    });
}

function updateByUUID(connection, userData, UUID, callback) {
    connection.query(query.updateAccountByUUID, [tables.user, userData, UUID], function (err, result) {
        callback(err, result);
    });
}

function updateAuthByID(connection, authData, authID, callback) {
    connection.query(query.updateByID, [tables.auth, authData, authID], function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readAccountByNickname: selectByNickname,
    readAccountByID: selectByID,
    readAccountByUUID: selectByUUID,
    readAccountByAuthID: selectByAuthID,
    readAuthByUserID: selectByUserID,
    readAuthIDByUUID: selectAuthIDByUUID,
    writeAuth: insertAuth,
    writeAccount: insertAccount,
    updateAccountByUUID: updateByUUID,
    updateAuthByID: updateAuthByID,
    option: {
        tables: tables,
        core: true
    }
};