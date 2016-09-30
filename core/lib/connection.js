var path = require('path');

var winston = require('winston');
var mysql = require('mysql');

var common = require('./common');

var databaseFile = require('../config/app_default.json');

var connectionPool = initializePool();

function initializePool() {
    winston.info('Access database connection');

    var databaseConfiguration, connectionPoolInstance;

    function databasePublicInfo(databaseConfiguration) {
        var info = clone(databaseConfiguration)
        info.dbUserPassword = '**********';
        return info
    }

    try {
        databaseConfiguration = require(path.join('../..', databaseFile.databaseConfig));
        winston.info(databasePublicInfo(databaseConfiguration));
    } catch (e) {
        winston.warn('database config file not exist');
    }


    function createPool() {
        winston.warn('Get database connection by new one');

        var pool = mysql.createPool({
            connectionLimit: 50,
            acquireTimeout: 30000, // 30s
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || common.databaseDefault.port,
            database: databaseConfiguration.dbName || common.databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        });

        pool.on('connection', function(){
            winston.verbose('데이터베이스 커넥션 완료...');
        });

        pool.on('enqueue', function () {
            winston.verbose('데이터베이스 커넥션 대기...');
        });

        return pool;
    }

    return {
        getConnection: function () {
            if (!connectionPoolInstance) {
                connectionPoolInstance = createPool();
            }

            return connectionPoolInstance;
        }
    }
}

module.exports = {
    get: connectionPool.getConnection
};

//TODO: Will change deep copy library.
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}