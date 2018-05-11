var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var databaseDefault = misc.getDatabaseDefault();

var tables = {
    // mailgun: databaseDefault.tablePrefix + 'mailgun'
};

function deleteScheme(databaseConfiguration, callback) {
    callback(databaseConfiguration);
}

function createScheme(databaseConfiguration, callback, done) {
    callback && callback(databaseConfiguration, done);
}

function insertDummy(databaseConfiguration, done) {
    done && done();
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    option: {
        tables: tables,
        core: false
    }
};