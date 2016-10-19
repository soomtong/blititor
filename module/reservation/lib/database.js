var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    reservationList: common.databaseDefault.prefix + 'reservation_list',
    reservationStatus : common.databaseDefault.prefix + 'reservation_status'
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
    var tableList = [tables.reservationStatus, tables.reservationList];

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

    var sql_reservation_list = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category` tinyint default 0, ' +
        '`name` varchar(16) not null, ' +
        '`email` varchar(256), ' +
        '`phone` varchar(16), ' +
        '`info` varchar(128), ' +
        '`stat` varchar(128), ' +
        '`flag` varchar(1), ' +
        '`status_id` varchar(256), ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX updated_at(`updated_at`), ' +
        'INDEX category(`category`))';
    var sql_reservation_status = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`sort` int unsigned not null default 0, ' +
        '`category` tinyint default 0, ' +
        '`hide` int(1) default 0, ' +
        '`title` varchar(64), ' +
        '`sub_title` varchar(256), ' +
        '`counter` int unsigned not null default 0, ' +
        '`max_count` int unsigned not null default 0, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX sort(`sort`), ' +
        'INDEX updated_at(`updated_at`), ' +
        'INDEX category(`category`))';

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
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy_status.json');
            var iteratorAsync = function (item, callback) {
                var reservationStatus = {
                    category: item.category,
                    title: item.title,
                    sub_title: item.sub_title,
                    counter: item.counter,
                    max_count: item['max_count'],
                    created_at: new Date(),
                    updated_at: new Date()
                };

                insertStatus(connection, reservationStatus, function (err, result) {
                    console.log('   inserted records...'.white, result.insertId);

                    callback(null, result);
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

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readReservationStatus: selectReservationStatus,
    addStatus: insertStatus,
    // createGalleryImageItem: insertImage,
    // readGalleryCategory: selectCategory,
    // readGalleryImageList: selectImageList,
    option: {
        tables: tables,
        core: false
    }
};
