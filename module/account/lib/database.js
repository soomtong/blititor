const fs = require('fs');
const async = require('neo-async');

const mysql = require('mysql');
const winston = require('winston');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const databaseDefault = misc.getDatabaseDefault();

const tables = {
    user: databaseDefault.tablePrefix + 'user',
    auth: databaseDefault.tablePrefix + 'auth',
    point: databaseDefault.tablePrefix + 'point'
};

const query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const sql = "DROP TABLE IF EXISTS ??";
    const tableList = [tables.point, tables.user, tables.auth];

    connection.query(sql, [tableList], function (error, results, fields) {
        connection.destroy();
        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const charSet = 'utf8mb4';

    const sql_auth = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` varchar(64) not null, ' +
        '`user_password` varchar(512) not null, ' +
        'UNIQUE auth_user_id_unique(`user_id`))' +
        'DEFAULT CHARSET=' + charSet;
    const sql_user = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`uuid` char(36) not null, `auth_id` int unsigned not null, ' +
        '`nickname` varchar(64), `level` varchar(3), `grant` varchar(3), ' +
        '`status` varchar(1), `avatar` varchar(255), `photo` varchar(255), `point` int, ' +
        '`login_counter` int unsigned, `logout_counter` int unsigned, ' +
        '`profile` varchar(255), `desc` text, ' +
        '`last_logged_at` datetime, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'UNIQUE user_uuid_unique(`uuid`), ' +
        'INDEX auth_id(`auth_id`))' +
        'DEFAULT CHARSET=' + charSet;
    const sql_point = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_id` int unsigned not null, `amount` int, `reason` varchar(255), ' +
        '`created_at` datetime, ' +
        'INDEX user_id(`user_id`))' +
        'DEFAULT CHARSET=' + charSet;

    const sql_fkey_user_auth = 'alter table ?? ' +
        'add constraint user_auth_id_foreign foreign key (`auth_id`) ' +
        'references ?? (`id`)' +
        'DEFAULT CHARSET=' + charSet;
    const sql_fkey_point_user = 'alter table ?? ' +
        'add constraint point_user_id_foreign foreign key (`user_id`) ' +
        'references ?? (`id`)' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_auth, tables.auth, function (error, result) {
        connection.query(sql_user, tables.user, function (error, result) {
            connection.query(sql_point, tables.point, function (error, result) {
                // bind foreign key
                connection.query(sql_fkey_user_auth, [tables.user, tables.auth], function (error, result) {
                    connection.query(sql_fkey_point_user, [tables.point, tables.user], function (error, result) {
                        // for dummy
                        callback && callback(databaseConfiguration, done);

                        connection.destroy();
                    });
                });
            });
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 2) {
            const connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || databaseDefault.port,
                database: databaseConfiguration.dbName || databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            const dummy = require('./dummy.json');
            const iteratorAsync = function (item, callback) {
                const authData = {
                    user_id: item.email,
                    user_password: item.password
                };
                const userData = {
                    uuid: common.UUID4(),
                    auth_id: null,
                    nickname: item.nickname.toString(),
                    level: 1,
                    grant: '',
                    login_counter: 0,
                    last_logged_at: null,
                    created_at: new Date()
                };

                insertDummyAccount(connection, authData, userData, function (err, result) {
                    console.log('   inserted records...');

                    callback(err, result);
                });
            };
            const resultAsync = function (err, result) {
                console.log(' = Inserted default records...');

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

        const auth_id = result['insertId'];

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

            const id = result['insertId'];

            console.log(' = New User ID Generated...', id);

            callback(err, result);
        });
    });
}

function selectByID(connection, id, callback) {
    const field = ["id", "uuid", "nickname", "photo", "level", "grant", "login_counter"];

    connection.query(query.selectByID, [field, tables.user, id], function (err, rows) {
        if (err || !rows || !rows[0]) {
            winston.error(err);
            return callback(err, {});
        }

        return callback(err, rows[0]);
    });
}

function selectByUUID(connection, uuid, callback) {
    const field1 = ['user_id'];
    const field2 = ['id', 'uuid', 'nickname', 'avatar', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at', 'login_counter'];

    connection.query(query.selectByUUIDWithAuth, [field1, field2, tables.auth, tables.user, uuid], function (err, rows) {
        if (err || !rows || !rows[0]) {
            return callback(err, {});
        }

        return callback(err, rows[0]);
    });
}

function selectByAuthID(connection, authID, callback) {
    const field1 = ['user_id'];
    const field2 = ['id', 'uuid', 'nickname', 'avatar', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at', 'login_counter'];

    let q = connection.query(query.selectByAuthIDWithAuth, [field1, field2, tables.auth, tables.user, authID], function (err, rows) {
        if (err || !rows || !rows[0]) {
            winston.error("Can't Select by This authID");
            winston.error(q.sql);

            return callback(err);
        }

        return callback(err, rows[0]);
    });
}

function selectByNickname(connection, nickname, callback) {
    const field = ['id', 'uuid', 'nickname', 'avatar', 'photo', 'level', 'grant', 'created_at', 'updated_at', 'last_logged_at'];

    connection.query(query.selectByUUID, [field, tables.user, nickname], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }

        return callback(err, rows[0]);
    });
}

function selectByUserID(connection, userID, callback) {
    const field = ['id', 'user_id', 'user_password'];

    connection.query(query.selectByUserID, [field, tables.auth, userID], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }

        return callback(err, rows[0]);
    });
}

function selectAuthIDByUUID(connection, UUID, callback) {
    connection.query(query.selectByUUID, ['auth_id', tables.user, UUID], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }

        return callback(err, rows[0]);
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