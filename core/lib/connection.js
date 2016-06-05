var winston = require('winston');
var MySQLConnectionManager = require('mysql-connection-manager');

var common = require('./common');

var connection = initConnection();

function initConnection() {
    winston.info('Access database connection');

    var databaseConfiguration = BLITITOR.config.database;
    var instance;

    function createInstance() {
        winston.warn('Get database connection by new one');

        var manager = new MySQLConnectionManager({
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || common.databaseDefault.port,
            database: databaseConfiguration.dbName || common.databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword,
            pool: {
                maxConnections: 50,
                maxIdleTime: 30
            }
        });

        manager.on('connect', function(connection) {
            console.log('\n데이터베이스 커넥션 완료...');
        });

        manager.on('reconnect', function(connection) {
            console.log('\n데이터베이스 커넥션 재접속...');
        });

        manager.on('disconnect', function() {
            console.log('\n데이터베이스 커넥션 해제...');
        });

        manager.on('error', function (err) {
            console.log('\n데이터베이스 커넥션 에러:', err);
/*
            if (err.code == 'PROTOCOL_CONNECTION_LOST') {
                console.error('커넥션 로스트!!!\n');
            } else {
                throw err;
            }
*/
        });

        return manager.connection;
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