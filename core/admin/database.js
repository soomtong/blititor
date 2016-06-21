var mysql = require('mysql');
var winston = require('winston');

var common = require('../lib/common');
var misc = require('../lib/misc');

var tables = misc.databaseTable();

function createDatabase(connection, dbName) {
    var sql_database = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';   // utf8

    connection.query(sql_database, [dbName, 'utf8'], function (error, result) {
        if (error) {
            console.log(' = Create database... Failed. Make Database yourself'.red);

            console.error('error connecting: ' + error);
        } else {
            console.log(' = Create database... Done \n'.green);
        }

        connection.destroy();
    });
}

module.exports = {
    createDatabase: createDatabase,
};