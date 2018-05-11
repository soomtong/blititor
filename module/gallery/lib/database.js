var fs = require('fs');
var async = require('neo-async');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var tables = {
    galleryCategory : misc.databaseDefault.tablePrefix + 'gallery_category',
    galleryImage: misc.databaseDefault.tablePrefix + 'gallery_image',
    user: misc.databaseDefault.tablePrefix + 'user'
};

var query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.galleryCategory, tables.galleryImage];

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

    var sql_gallery_image = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category` tinyint default 0, ' +
        '`sort` int unsigned not null default 0, ' +
        '`hide` int(1) default 0, ' +
        '`image` varchar(128) not null, `thumbnail` varchar(128) not null, ' +
        '`path` varchar(256) not null, ' +
        '`title` varchar(128), ' +
        '`link` varchar(128), ' +
        '`tags` varchar(128), ' +
        '`flag` varchar(1), ' +
        '`created_at` datetime, ' +
        'INDEX hide(`hide`), ' +
        'INDEX sort(`sort`), ' +
        'INDEX category(`category`))' +
        'DEFAULT CHARSET=' + charSet;
    var sql_gallery_category = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` tinyint unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`sort` tinyint unsigned not null default 0, ' +
        '`title` varchar(64), ' +
        '`sub_title` varchar(256), ' +
        '`created_at` datetime, ' +
        'INDEX sort(`sort`))' +
        'DEFAULT CHARSET=' + charSet;

    connection.query(sql_gallery_category, tables.galleryCategory, function (error, result) {
        connection.query(sql_gallery_image, tables.galleryImage, function (error, result) {
            // check dummy json
            callback && callback(databaseConfiguration, done);

            // close connection
            connection.destroy();
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    done && done();
}

function insertCategory(connection, params, callback) {
    var titleData = {
        title: params.title,
        sub_title: params.subTitle,
        created_at: new Date()
    };

    connection.query(query.insertInto, [tables.galleryCategory, titleData], function (err, result) {
        callback(err, result);
    });
}

function insertImage(connection, params, callback){
    var imageData = {
        category: Number(params.category),
        image: params.image,
        thumbnail: params.thumbnail,
        path: params.path,
        title: params.message,
        created_at: new Date()
    };

    connection.query(query.insertInto, [tables.galleryImage, imageData], function (err, result) {
        callback(err, result);
    });
}

function selectCategory(connection, callback) {
    connection.query(query.readGalleryCategory, [tables.galleryCategory], function (err, rows) {
        if (!err) callback(err, rows);
    });
}
function selectImageList(connection, params, callback) {
    connection.query(query.readGalleryImageList, [tables.galleryImage, params.category], function (err, rows) {
        if (!err) callback(err, rows);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    addCategory: insertCategory,
    createGalleryImageItem: insertImage,
    readGalleryCategory: selectCategory,
    readGalleryImageList: selectImageList,
    option: {
        tables: tables,
        core: false
    }
};
