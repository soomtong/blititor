const path = require('path');

const winston = require('winston');
const mysql = require('mysql');

const misc = require('./misc');
const databaseDefault = misc.getDatabaseDefault();

const configFile = require('../config/app_default.json').configFile;

const connectionPool = initializePool();

function initializePool() {
    winston.info('Access database connection');

    let databaseConfiguration, connectionPoolInstance;

    try {
        databaseConfiguration = require(path.join('../..', configFile))['database'];

        winston.info('connection pool information is' ,databasePublicInfo(databaseConfiguration));
    } catch (e) {
        winston.warn('database config file not exist');
    }


    function createPool() {
        winston.warn('Get database connection by new one');

        const pool = mysql.createPool({
            connectionLimit: 50,
            acquireTimeout: 30000, // 30s
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || databaseDefault.port,
            database: databaseConfiguration.dbName || databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword
        });

        pool.on('connection', function(){
            winston.verbose('finish database connecting...');
        });

        pool.on('enqueue', function () {
            winston.verbose('standby database connecting...');
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
    let databaseConfiguration;

    try {
        databaseConfiguration = require(path.join('../..', configFile))['database'];

        winston.verbose('session database connection information is' ,databasePublicInfo(databaseConfiguration));
    } catch (e) {
        winston.warn('database config file not exist in initSession function');
    }

    let sessionStore;
    const sessionOptions = {
        secret: BLITITOR.config['sessionSecret'],
        resave: true,
        saveUninitialized: true
    };

    if (databaseConfiguration) {
        winston.info("Started to make mysql connection process for global session system");

        sessionStore = new mysqlStore({
            host: databaseConfiguration.dbHost,
            port: databaseConfiguration.dbPort || databaseDefault.port,
            database: databaseConfiguration.dbName || databaseDefault.database,
            user: databaseConfiguration.dbUserID,
            password: databaseConfiguration.dbUserPassword,
            autoReconnect: false,
            useConnectionPooling: true,
            schema: {
                tableName: databaseDefault.tablePrefix + 'session'
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
    const info = clone(databaseConfiguration);

    info.dbUserPassword = '****';

    return info;
}
