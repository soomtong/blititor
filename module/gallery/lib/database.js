const fs = require('fs');
const async = require('neo-async');

const mysql = require('mysql');
const winston = require('winston');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const databaseDefault = misc.getDatabaseDefault();

const tables = {
    galleryCategory: databaseDefault.tablePrefix + 'gallery_category',
    galleryImage: databaseDefault.tablePrefix + 'gallery_image',
    user: databaseDefault.tablePrefix + 'user'
};

const query = require('./query');

function deleteScheme(databaseConfiguration, callback) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const sql = "DROP TABLE IF EXISTS ??";
    const tableList = [tables.galleryCategory, tables.galleryImage];

    connection.query(sql, [tableList], function (error, results, fields) {
        connection.destroy();

        callback(databaseConfiguration);
    });
}

function createScheme(databaseConfiguration, callback, done) {
    const connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || databaseDefault.port,
        database: databaseConfiguration.dbName || databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    const charSet = 'utf8mb4';

    const sql_gallery_image = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`category` tinyint default 0, ' +
        '`sort` int unsigned not null default 0, ' +
        '`hide` int(1) default 0, ' +
        '`image_name` varchar(128) not null, `image_file` varchar(128) not null, ' +
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
    const sql_gallery_category = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` tinyint unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`sort` tinyint unsigned not null default 0, ' +
        '`title` varchar(128) not null, ' +
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
    const categoryData = {
        title: params.title || '',
        sub_title: params.subTitle || '',
        created_at: new Date()
    };

    connection.query(query.insertInto, [tables.galleryCategory, categoryData], function (err, result) {
        callback(err, result);
    });
}

function insertImage(connection, params, callback){
    const imageData = {
        category: Number(params.category),
        image_name: params.imageName,
        image_file: params.imageFile,
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

function selectCategories(connection, callback) {
    connection.query(query.readGalleryCategories, [tables.galleryCategory], function (err, rows) {
        if (err) {
            winston.error('gallery database error: ' + err)
        }

        callback(err, rows);
    });
}

function selectImageList(connection, params, callback) {
    connection.query(query.readGalleryImageList, [tables.galleryImage, params.category], function (err, rows) {
        if (!err) callback(err, rows);
    });
}

function selectImages(connection, callback) {
    connection.query(query.readGalleryCategory, [tables.galleryImage], function (err, rows) {
        if (err) {
            winston.error('gallery database error: ' + err)
        }

        callback(err, rows);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    createCategory: insertCategory,
    createGalleryImageItem: insertImage,
    readAllCategories: selectCategories,
    readAllImages: selectImages,
    readGalleryCategory: selectCategory,
    readGalleryImageList: selectImageList,
    option: {
        tables: tables,
        core: false
    }
};
