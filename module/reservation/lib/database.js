const fs = require('fs');
const async = require('neo-async');

const mysql = require('mysql');
const winston = require('winston');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const databaseDefault = misc.getDatabaseDefault();

const tables = {
    reservationList: databaseDefault.tablePrefix + 'reservation_list',
    reservationStatus: databaseDefault.tablePrefix + 'reservation_status'
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
    const tableList = [tables.reservationStatus, tables.reservationList];

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

    const sql_reservation_list = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category` tinyint default 0, ' +
        '`name` varchar(16) not null, ' +
        '`email` varchar(256), ' +
        '`phone` varchar(16), ' +
        '`info` tinytext, ' +
        '`status` text, ' +   // applied status id a string divided ','
        '`flag` varchar(1), ' +        // special flag for the future
        '`comment` tinytext, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX name(`name`), ' +
        'INDEX email(`email`), ' +
        'INDEX phone(`phone`), ' +
        'INDEX updated_at(`updated_at`), ' +
        'INDEX category(`category`))' +
        'DEFAULT CHARSET=' + charSet;
    const sql_reservation_status = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`sort` int unsigned not null default 0, ' +
        '`category` tinyint default 0, ' +
        '`hide` int(1) default 0, ' +
        '`close` int(1) default 0, ' +
        '`title` varchar(64), ' +
        '`sub_title` varchar(256), ' +
        '`counter` int unsigned not null default 0, ' +
        '`max_count` int unsigned not null default 0, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX sort(`sort`), ' +
        'INDEX updated_at(`updated_at`), ' +
        'INDEX category(`category`))' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_reservation_status, tables.reservationStatus, function (error, result) {
        connection.query(sql_reservation_list, tables.reservationList, function (error, result) {
            // check dummy json
            callback && callback(databaseConfiguration, done);

            // close connection
            connection.destroy();
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy_status.json', function (error, result) {
        if (!error && result.size > 1) {
            const connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || databaseDefault.port,
                database: databaseConfiguration.dbName || databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            const dummy = require('./dummy_status.json');
            const iteratorAsync = function (item, callback) {
                const reservationStatus = {
                    category: item.category,
                    title: item.title,
                    sub_title: item.sub_title,
                    counter: item.counter,
                    max_count: item['max_count'],
                    created_at: new Date(),
                    updated_at: new Date()
                };

                insertStatus(connection, reservationStatus, function (err, result) {
                    console.log('   inserted records...', result.insertId);

                    callback(null, result);
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

function selectReservationStatus(connection, category, callback) {
    connection.query(query.readReservationStatus, [tables.reservationStatus, category], function (err, rows) {
        if (err) winston.error(err);

        callback(err, rows);
    });
}

function insertStatus(connection, statusData, callback) {
    connection.query(query.insertInto, [tables.reservationStatus, statusData], function (err, result) {
        if (err) winston.error(err);

        callback(err, result);
    });
}

function selectReservationByIdentifier(connection, reservationData, callback) {
    connection.query(query.selectByIdentifier, [tables.reservationList, reservationData.category, reservationData.name, reservationData.email, reservationData.phone], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }

        return callback(err, rows[0]);
    });
}

function insertReservation(connection, reservationData, callback) {
    connection.query(query.insertInto, [tables.reservationList, reservationData], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }

        return callback(err, result);
    });
}

function updateReservation(connection, params, callback) {
    connection.query(query.updateByID, [tables.reservationList, params.reservationData, params.id], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }

        return callback(err, result);
    });
}

function readReservationStatusByID(connection, statusIDs, callback) {
    connection.query(query.selectByIDs, [tables.reservationStatus, statusIDs], function (err, rows) {
        if (err || !rows) {
            return callback(err, {});
        }

        return callback(err, rows);
    });
}

function increaseReservationStatus(connection, statusID, callback) {
    connection.query(query.increaseStatusByID, [tables.reservationStatus, statusID], function (err, result) {
        if (err) winston.error(err);

        return callback(err, result);
    });
}

function decreaseReservationStatus(connection, statusID, callback) {
    connection.query(query.decreaseStatusByID, [tables.reservationStatus, statusID], function (err, result) {
        if (err) winston.error(err);

        return callback(err, result);
    });
}

function selectReservationList(connection, page, category, callback) {
    const pageSize = 10;
    const gutterSize = 10;
    const gutterMargin = 3;

    const result = {
        total: 0,
        page: Math.abs(Number(page)),
        reservationList: [],
        statusInfo: {}
    };

    selectReservationStatus(connection, category, function (error, statusInfo) {

        statusInfo.map(function (item) {
            result.statusInfo[item.id] = item.title;
        });

        connection.query(query.countAllReservationList, [tables.reservationList, category], function (err, rows) {
            result.total = rows[0]['count'] || 0;

            const pagination = common.pagination(result.page, result.total, pageSize, gutterSize, gutterMargin);

            connection.query(query.readReservationListByPage, [tables.reservationList, category, pagination.index, pagination.pageSize], function (err, rows) {
                if (err) {
                    winston.error(err);
                } else {
                    result.pagination = pagination;

                    result.reservationList = rows;

                    result.reservationList.map(function (item) {
                        if (item.status && item.status.length) {
                            const statusTitle = [];
                            const status = item.status.split(',');

                            status.map(function (info) {
                                statusTitle.push({id: info, title: result.statusInfo[info]});
                            });

                            item.statusInfo = statusTitle;
                        }
                    });
                }

                callback(err, result);
            });
        });
    });
}

function selectReservationListFull(connection, category, callback) {
    const result = {
        total: 0,
        reservationList: [],
        statusInfo: {}
    };

    selectReservationStatus(connection, category, function (error, statusInfo) {

        statusInfo.map(function (item) {
            result.statusInfo[item.id] = item.title;
        });

        connection.query(query.countAllReservationList, [tables.reservationList, category], function (err, rows) {

            result.total = rows[0]['count'] || 0;

            connection.query(query.readReservationList, [tables.reservationList, category], function (err, rows) {
                if (err) {
                    winston.error(err);
                } else {
                    result.reservationList = rows;

                    result.reservationList.map(function (item) {
                        if (item.status && item.status.length) {
                            const statusTitle = [];
                            const status = item.status.split(',');

                            status.map(function (info) {
                                statusTitle.push({id: info, title: result.statusInfo[info]});
                            });

                            item.statusInfo = statusTitle;
                        }
                    });
                }

                callback(err, result);
            });

        });
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readReservationStatus: selectReservationStatus,
    readReservationStatusByID: readReservationStatusByID,
    addStatus: insertStatus,
    readReservationByReservationData: selectReservationByIdentifier,
    createReservation: insertReservation,
    updateReservation: updateReservation,
    increaseReservationStatus: increaseReservationStatus,
    decreaseReservationStatus: decreaseReservationStatus,
    readReservationList: selectReservationList,
    readReservationListFull: selectReservationListFull,
    option: {
        tables: tables,
        core: false
    }
};
