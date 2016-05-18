var winston = require('winston');
var driver = require('mysql');

var common = require('./common');

var connection = initConnection();

function initConnection() {
    winston.info('Access database connection');

    var databaseConfiguration = BLITITOR.config.database;
    var instance;

    function createInstance() {
        winston.warn('Get database connection by new one');

        return driver.createConnection({
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || common.databaseDefault.port,
            database: databaseConfiguration.dbName || common.databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        });
    }

    return {
        getConnection: function () {
            if (!instance) {
                instance = createInstance();
            }

            return instance;
        }
    }
}

module.exports = {
    get: connection.getConnection
};