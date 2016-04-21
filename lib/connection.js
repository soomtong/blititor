var winston = require('winston');
var knex = require('knex');

var common = require('./common');

function getConnection() {
    var databaseConfiguration = BLITITOR.config.database;

    if (BLITITOR.connection) {
        winston.warn('Get database connection by pre-init');
        return BLITITOR.connection;
    }
    else {
        winston.warn('Get database connection by new');

        BLITITOR.connection = knex({
            debug: true,
            client: 'mysql',
            connection: {
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            }
        });

        return BLITITOR.connection;
    }
}

module.exports = {
    get: getConnection
};