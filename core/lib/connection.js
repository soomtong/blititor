var path = require('path');

var winston = require('winston');
var mysql = require('mysql');

var misc = require('./misc');

var configFile = require('../config/app_default.json').configFile;

var connectionPool = initializePool();

function initializePool() {
    winston.info('Access database connection');

    var databaseConfiguration, connectionPoolInstance;

    try {
        databaseConfiguration = require(path.join('../..', configFile))['database'];

        winston.info('connection pool information is' ,databasePublicInfo(databaseConfiguration));
    } catch (e) {
        winston.warn('database config file not exist');
    }


    function createPool() {
        winston.warn('Get database connection by new one');

        var pool = mysql.createPool({
            connectionLimit: 50,
            acquireTimeout: 30000, // 30s
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || misc.databaseDefault.port,
            database: databaseConfiguration.dbName || misc.databaseDefault.database,
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

function initSession(mysqlStore, callback) {
    var databaseConfiguration;

    try {
        databaseConfiguration = require(path.join('../..', configFile))['database'];

        winston.verbose('session database connection information is' ,databasePublicInfo(databaseConfiguration));
    } catch (e) {
        winston.warn('database config file not exist in initSession function');
    }

    var sessionStore;
    var sessionOptions = {
        secret: BLITITOR.config['sessionSecret'],
        resave: true,
        saveUninitialized: true
    };

    if (databaseConfiguration) {
        winston.info("Started to make mysql connection process for global session system");

        sessionStore = new mysqlStore({
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || misc.databaseDefault.port,
            database: databaseConfiguration.dbName || misc.databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword,
            autoReconnect: false,
            useConnectionPooling: true,
            schema: {
                tableName: misc.databaseDefault.tablePrefix + 'session'
            }
        });

        sessionOptions.store = sessionStore;
    } else {
        winston.warn("Database Session store is not Valid, use Internal Session store. check database configuration and restart Application!");
    }

    callback(sessionOptions);
}

module.exports = {
    get: connectionPool.getConnection,
    initSession: initSession
};

//TODO: Will change deep copy library.
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function databasePublicInfo(databaseConfiguration) {
    var info = clone(databaseConfiguration);

    info.dbUserPassword = '****';

    return info;
}
