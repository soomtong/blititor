var knex = require('knex');

var common = require('./common');

var databaseConfiguration = BLITITOR.config.database;

function getConnection() {
    return knex({
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
}

module.exports = {
    get: getConnection
};