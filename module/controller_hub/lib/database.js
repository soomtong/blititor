var fs = require('fs');
var async = require('neo-async');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var controllerHubFlag = misc.commonFlag().controllerHub;

var tables = {
    controller: misc.databaseDefault.tablePrefix + 'controller',  // hub info and main controller info
    gateway: misc.databaseDefault.tablePrefix + 'gateway',
    gatewayGroup: misc.databaseDefault.tablePrefix + 'gateway_group',
    rtvm: misc.databaseDefault.tablePrefix + 'rtvm',
    user: misc.databaseDefault.tablePrefix + 'user'  // refer `module/account/lib/database.js`
};

var Queries = require('./query');

var PAGE_SIZE = 12;
var GUTTER_SIZE = 10;
var GUTTER_MARGIN = 3;

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.controller, tables.gateway, tables.gatewayGroup, tables.rtvm];

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

    var charSet = 'utf8mb4';

    var sql_controller = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`controller_id` varchar(64), ' +
        '`controller_title` varchar(128), ' +
        '`controller_subject` varchar(256), ' +
        '`created_at` datetime, ' +
        'UNIQUE controller_id_unique(`controller_id`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_gatewayGroup = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`flag` tinyint unsigned default 0, ' +             // for real-time feedback
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`group_title` varchar(128), ' +
        '`group_subject` varchar(256), ' +
        '`group_tag` varchar(64), ' +
        '`group_image` varchar(256), ' +
        '`group_count` int unsigned not null DEFAULT 0, ' +
        '`group_order` tinyint unsigned not null DEFAULT 1, ' +
        '`created_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX group_order(`group_order`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_gateway = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`gateway_uuid` char(36) not null, ' +
        '`gateway_ip` varchar(16), ' +
        '`gateway_port` varchar(6), ' +
        '`version` varchar(32), ' +
        '`title` varchar(256), ' +
        '`group_id` int unsigned not null DEFAULT 0, ' +
        '`vm_count` int unsigned not null DEFAULT 0, ' +
        '`app_count` int unsigned not null DEFAULT 0, ' +
        '`description` text, ' +
        '`secret_string` text, ' +
        '`installed_apps` varchar(256), ' +
        '`pinned` tinyint unsigned default 0, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX group_id(`group_id`), ' +
        'INDEX gateway_uuid(`gateway_uuid`),' +
        'INDEX created_at(`created_at`)) ' +
        'DEFAULT CHARSET=' + charSet;
    var sql_rtvm = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`gateway_id` int unsigned not null DEFAULT 0, ' +
        '`rtvm_uuid` char(36) not null, ' +
        '`title` varchar(256), ' +
        '`status` varchar(6) default 0, ' +   // for real-time feedback
        '`core_count` varchar(2), ' +
        '`vm_memory_size` varchar(3), ' +
        '`vm_storage_size` varchar(3), ' +
        '`nic_dev` varchar(256), ' +
        '`nic_mac` varchar(256), ' +
        '`nic_input_buffer_size` varchar(6), ' +
        '`nic_output_buffer_size` varchar(6), ' +
        '`nic_input_bandwidth_size` varchar(6), ' +
        '`nic_output_bandwidth_size` varchar(6), ' +
        '`nic_head_padding_size` varchar(6), ' +
        '`nic_tail_padding_size` varchar(6), ' +
        '`nic_pool_size` varchar(6), ' +
        '`vm_description` text, ' +
        '`installed_app_id` int unsigned not null DEFAULT 0, ' +
        '`installed_app_title` varchar(256), ' +
        '`has_monitor` tinyint unsigned default 0, ' +
        '`has_dashboard` tinyint unsigned default 0, ' +
        '`dashboard_link` varchar(256), ' +
        '`pinned` tinyint unsigned default 0, ' +
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX gateway_id(`gateway_id`),' +
        'INDEX rtvm_uuid(`rtvm_uuid`),' +
        'INDEX created_at(`created_at`)) ' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_controller, tables.controller, function (error, result) {
        connection.query(sql_gatewayGroup, tables.gatewayGroup, function (error, result) {
            connection.query(sql_gateway, tables.gateway, function (error, result) {
                connection.query(sql_rtvm, tables.rtvm, function (error, result) {
                    // check dummy json
                    callback && callback(databaseConfiguration, done);

                    // close connection
                    connection.destroy();
                });
            });
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy1.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy1.json');

            var iteratorAsync = function (item, callback) {
                var groupData = {
                    flag: controllerHubFlag.gatewayGroup.normal,
                    group_title: item.group_title,
                    group_subject: item.group_subject,
                    group_tag: item.group_tag,
                    group_image: item.group_image || '//placeimg.com/50/50/' + common.randomNumber(1),
                    created_at: new Date()
                };

                createGatewayGroup(connection, groupData, function (err, result) {
                    console.log('   inserted controllerGatewayGroup records...'.white, result['insertId']);

                    callback(null, result);
                });
            };

            var resultAsync = function (err, result) {
                console.log(' = Inserted controller records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });

    fs.stat(__dirname + '/dummy2.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy2.json');

            var iteratorAsync = function (item, callback) {
                var gatewayData = {
                    gateway_uuid: common.UUID1(),
                    gateway_ip: item.gateway_ip,
                    title: item.title,
                    version: item.version,
                    installed_apps: item.installed_apps,
                    description: item.description,
                    group_id: Number(item.group_id) || 1,
                    created_at: new Date()
                };

                createGateway(connection, gatewayData, function (err, result) {
                    console.log('   inserted controllerGateway records...'.white, result['insertId']);

                    callback(null, result);
                });
            };

            var resultAsync = function (err, result) {
                console.log(' = Inserted gateway records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });

    fs.stat(__dirname + '/dummy3.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            var dummy = require('./dummy3.json');

            var iteratorAsync = function (item, callback) {
                var rtvmData = {
                    gateway_id: 1,
                    rtvm_uuid: common.UUID1(),
                    title: item.title,
                    core_count: 1,
                    vm_memory_size: 16,
                    vm_storage_size: 16,
                    nic_dev: '',
                    nic_mac: '',
                    nic_input_buffer_size: '1024',
                    nic_output_buffer_size: '1024',
                    nic_input_bandwidth_size: '1G',
                    nic_output_bandwidth_size: '1G',
                    nic_head_padding_size: '32',
                    nic_tail_padding_size: '32',
                    nic_pool_size: '4M',
                    installed_app_id: item.installed_app_id || 0,
                    vm_description: item.description,
                    created_at: new Date()
                };

                createRtvm(connection, rtvmData, function (err, result) {
                    console.log('   inserted Real-time VM records...'.white, result['insertId']);

                    callback(null, result);
                });
            };

            var resultAsync = function (err, result) {
                console.log(' = Inserted rtvm records...'.blue);

                // for async
                done && done(err, result);

                // close connection
                connection.destroy();
            };

            async.mapSeries(dummy, iteratorAsync, resultAsync);
        }
    });

}

function createGateway(connection, gatewayData, callback) {
    connection.query(Queries.insertInto, [tables.gateway, gatewayData], function (error, result) {
        callback(error, result);
    });
}

function createGatewayGroup(connection, groupData, callback) {
    connection.query(Queries.insertInto, [tables.gatewayGroup, groupData], function (error, result) {
        callback(error, result);
    });
}

function createRtvm(connection, rtvmData, callback) {
    connection.query(Queries.insertInto, [tables.rtvm, rtvmData], function (error, result) {
        callback(error, result);
    });
}

function selectGatewayGroupList(connection, callback) {
    connection.query(Queries.selectAll, [tables.gatewayGroup], function (error, rows) {
        callback(error, rows);
    });
}

function selectGatewayList(connection, callback) {
    connection.query(Queries.selectAll, [tables.gateway], function (error, rows) {
        callback(error, rows);
    });
}

function selectGateway(connection, gatewayID, callback) {
    connection.query(Queries.selectGatewayByID, [tables.gateway, tables.gatewayGroup, gatewayID], function (error, rows) {
        callback(error, rows)
    });
}

function selectRtvmList(connection, gatewayID, callback) {
    connection.query(Queries.selectRtvmByGatewayID, [tables.rtvm, gatewayID], function (error, rows) {
        callback(error, rows)
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    createGateway: createGateway,
    createGroup: createGatewayGroup,
    getGatewayGroupList: selectGatewayGroupList,
    getGatewayList: selectGatewayList,
    getGatewayInfo: selectGateway,
    createRtvm: createRtvm,
    getRtvmList: selectRtvmList,
    option: {
        tables: tables
    }
};

function insertCategory(connection, storeAppCategoryData, callback) {
    var existingAppCategory = {
        controller_title: storeAppCategoryData.controller_title,
        controller_subject: storeAppCategoryData.controller_subject,
        created_at: new Date()
    };

    connection.query(Queries.insertCategoryInto, [tables.storeAppCategory, storeAppCategoryData, existingAppCategory], function (err, insertAppResult) {
        callback(err, insertAppResult);
    });
}