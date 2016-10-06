var fs = require('fs');
var async = require('neo-async');
var colors = require('colors');

var mysql = require('mysql');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var postFlag = misc.commonFlag().post;

var tables = {
    teamblog: common.databaseDefault.prefix + 'teamblog',
    teamblogHistory: common.databaseDefault.prefix + 'teamblog_history',
    teamblogRelated: common.databaseDefault.prefix + 'teamblog_related',
    teamblogTag: common.databaseDefault.prefix + 'teamblog_tag',
    teamblogTagRelated: common.databaseDefault.prefix + 'teamblog_tag_related',
    user: common.databaseDefault.prefix + 'user'  // refer `module/account/lib/database.js`
};

var query = require('./query');

var fields_teamblog = ['id', 'user_uuid', 'user_id', 'nickname', 'custom_url', 'title', 'content', 'tags', 'header_imgs', 'flag', 'pinned', 'created_at', 'updated_at'];

function deleteScheme(databaseConfiguration, callback) {
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

    var sql = "DROP TABLE IF EXISTS ??";
    var tableList = [tables.teamblog, tables.teamblogHistory, tables.teamblogRelated, tables.teamblogTag, tables.teamblogTagRelated];

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

    var sql_teamblog = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`user_uuid` char(36) not null, `user_id` int unsigned not null, ' +
        '`nickname` varchar(64), ' +
        '`custom_url` varchar(128), ' +
        '`title` varchar(256), ' +
        '`content` text, ' +
        '`tags` varchar(256), ' +
        '`header_imgs` varchar(256), ' +    // presented json type array
        '`flag` varchar(8), ' +             // render type or some special mark for this post
        '`pinned` tinyint unsigned default 0, ' +   // it can apply ordered pinned list not only recently
        '`created_at` datetime, ' +
        '`updated_at` datetime, ' +
        'INDEX pinned(`pinned`), ' +
        'INDEX custom_url(`custom_url`), ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX user_id(`user_id`))';
    var sql_teamblog_history = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`post_id` int unsigned not null, ' +
        '`title` varchar(256), ' +
        '`content` text, ' +
        '`tags` text, ' +
        '`created_at` datetime, ' +
        'INDEX created_at(`created_at`), ' +
        'INDEX post_id(`post_id`))';
    var sql_teamblog_related = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`post_id` int unsigned not null, ' +
        '`related_post_id` int unsigned not null, ' +
        '`created_at` datetime, ' +
        'INDEX related_post_id(`related_post_id`), ' +
        'INDEX post_id(`post_id`))';
    var sql_teamblog_tag = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`tag` varchar(128), ' +
        '`tag_count` int unsigned not null DEFAULT 1, ' +
        '`created_at` datetime, ' +
        'INDEX tag(`tag`), ' +
        'INDEX tag_count(`tag_count`))';
    var sql_teamblog_tag_related = 'CREATE TABLE IF NOT EXISTS ?? ' +
        '(`id` int unsigned not null AUTO_INCREMENT PRIMARY KEY, ' +
        '`tag_id` int unsigned not null, ' +
        '`tag_related_post_id` int unsigned not null, ' +
        '`created_at` datetime, ' +
        'INDEX tag_related_post_id(`tag_related_post_id`), ' +
        'INDEX tag_id(`tag_id`))';
    var sql_fkey_user_id = 'alter table ?? ' +
        'add constraint teamblog_user_id_foreign foreign key (`user_id`) ' +
        'references ?? (`id`)';

    connection.query(sql_teamblog, tables.teamblog, function (error, result) {
        connection.query(sql_teamblog_history, tables.teamblogHistory, function (error, result) {
            connection.query(sql_teamblog_related, tables.teamblogRelated, function (error, result) {
                connection.query(sql_teamblog_tag, tables.teamblogTag, function (error, result) {
                    connection.query(sql_teamblog_tag_related, tables.teamblogTagRelated, function (error, result) {
                        // console.log(error, result);
                        // bind foreign key
                        connection.query(sql_fkey_user_id, [tables.teamblog, tables.user], function (error, result) {
                            // check dummy json
                            callback && callback(databaseConfiguration, done);

                            // close connection
                            connection.destroy();
                        });
                    });
                });
            });
        });
    });
}

function insertDummy(databaseConfiguration, done) {
    fs.stat(__dirname + '/dummy.json', function (error, result) {
        if (!error && result.size > 2) {
            var connection = mysql.createConnection({
                host: databaseConfiguration.dbHost,
                port: databaseConfiguration.dbPort || common.databaseDefault.port,
                database: databaseConfiguration.dbName || common.databaseDefault.database,
                user: databaseConfiguration.dbUserID,
                password: databaseConfiguration.dbUserPassword
            });

            getAnyAuthor(connection, function (err, author) {
                var dummy = require('./dummy.json');

                var iteratorAsync = function (item, callback) {
                    var flag = '', header_imgs = '';

                    if (item.render && (item.render.toString().indexOf(postFlag.markdown.value) !== -1)) {
                        flag = flag.concat(postFlag.markdown.value);
                    }

                    if (item.headerPic && (JSON.parse(item.headerPic.toString()).length > 0)) {
                        flag = flag.concat(postFlag.headedPicture.value);
                    }

                    // separated array list
                    var tagList = item.tags.split(',').map(function (tag) {
                        return tag.trim();
                    });

                    var teamblogData = {
                        user_uuid: author.uuid,
                        user_id: author.id,
                        nickname: author.nickname,
                        custom_url: item.custom_url,
                        title: item.title,
                        content: item.content,
                        tags: tagList.join(','),
                        header_imgs: item.headerPic ? item.headerPic.toString() : '',
                        flag: flag.trim(),
                        pinned: item.pinned ? 1 : 0,
                        created_at: new Date()
                    };

                    insertPost(connection, teamblogData, function (err, result) {
                        console.log('   inserted post records...'.white, result.insertId);

                        var iterator2Async = function (item, callback) {
                            var tagData = {
                                tag: item.toString().trim(),
                                tag_count: 1,
                                created_at: new Date()
                            };

                            updatedTagList(connection, tagData, function (err, affectedId) {
                                var tagRelatedPostData = {
                                    tag_id: affectedId,
                                    tag_related_post_id: result.insertId,
                                    created_at: new Date()
                                };

                                insertTagRelatedPost(connection, tagRelatedPostData, function (err, result) {
                                    callback(err, result);
                                });

                                console.log('   processed tag records...'.white, affectedId);
                            });
                        };

                        // going sync
                        async.mapSeries(tagList, iterator2Async, callback);
                    });
                };

                var resultAsync = function (err, result) {
                    console.log(' = Inserted default records...'.blue);

                    // for async
                    done && done(err, result);

                    // close connection
                    connection.destroy();
                };

                async.mapSeries(dummy, iteratorAsync, resultAsync);
            });
        }
    });
}

function getAnyAuthor(connection, callback) {
    var fields = ['id', 'uuid', 'auth_id', 'nickname'];

    connection.query(query.anyAuthor, [fields, tables.user], function (error, results) {
        callback(error, results[0]);
    });
}

function selectByPage(connection, page, callback) {
    var pageSize = 10;

    var result = {
        total: 0,
        page: Math.abs(Number(page)),
        index: 0,
        maxPage: 0,
        pageSize: pageSize,
        teamblogList: []
    };

    connection.query(query.countAll, [tables.teamblog], function (err, rows) {
        result.total = rows[0]['count'] || 0;

        var maxPage = Math.floor(result.total / pageSize);
        if (maxPage < result.page) {
            result.page = maxPage;
        }

        result.maxPage = maxPage;
        result.index = Number(result.page) * pageSize;
        if (result.index < 0) result.index = 0;

        connection.query(query.countAllGroupByMonth, ['created_at', 'created_at', tables.teamblog, 'created_at', 'created_at', 'created_at'], function (err, results) {
            result.postGroupList = results;

            connection.query(query.readTeamblogByPage, [fields_teamblog, tables.teamblog, result.index, pageSize], function (err, rows) {
                if (!err) result.teamblogList = rows;
                callback(err, result);
            });
        });
    });
}

function selectAllByMonth(connection, year, month, callback) {
    var result = {
        total: 0,
        teamblogList: []
    };

    connection.query(query.countAllGroupByMonth, ['created_at', 'created_at', tables.teamblog, 'created_at', 'created_at', 'created_at'], function (err, results) {
        result.postGroupList = results;

        if (year < 1900 || year > 3000) year = Date.now().getFullYear();
        if (month < 0 || month > 12) month = Date.now().getMonth() + 1;

        connection.query(query.readTeamblogMonthlyAll, [fields_teamblog, tables.teamblog, 'created_at', year, 'created_at', month], function (err, rows) {
            result.teamblogList = rows;
            callback(err, result);
        });
    });
}

function selectAllByTag(connection, tag, callback) {
    var result = {
        total: 0,
        teamblogList: []
    };

    connection.query(query.readTeamblogByTagAll, [tables.teamblogTag, tables.teamblogTagRelated, tables.teamblog, tag], function (err, rows) {
        result.teamblogList = rows;
        callback(err, result);
    });
}

function selectPostRecently(connection, limit, callback) {
    connection.query(query.readTeamblogRecently, [fields_teamblog, tables.teamblog, Number(limit)], function (err, rows) {
        callback(err, rows);
    });
}

function selectPostPinned(connection, limit, callback) {
    connection.query(query.readTeamblogPinned, [fields_teamblog, tables.teamblog, postFlag.pinned.value, Number(limit)], function (err, rows) {
        callback(err, rows);
    });
}

function insertPost(connection, teamblogData, callback) {
    connection.query(query.insertInto, [tables.teamblog, teamblogData], function (err, insertPostResult) {
        var tagData = {
            tag: teamblogData.tags.toString().trim(),
            tag_count: 1,
            created_at: new Date()
        };

        updatedTagList(connection, tagData, function (err, affectedId) {
            var tagRelatedPostData = {
                tag_id: affectedId,
                tag_related_post_id: insertPostResult.insertId,
                created_at: new Date()
            };

            insertTagRelatedPost(connection, tagRelatedPostData, function (err, insertTagRelatedPostResult) {
                callback(err, { insertPostId: insertPostResult.insertId, insertTagId: insertTagRelatedPostResult.insertId});
            });

            console.log('   processed tag records...'.white, affectedId);
        });
    });
}

function updatePost(connection, teamblogID, replyData, callback) {
    connection.query(query.updateByID, [tables.teamblog, replyData, teamblogID], function (err, result) {
        callback(err, result);
    });
}

function selectPostByID(connection, postID, callback) {
    connection.query(query.selectByID, [fields_teamblog, tables.teamblog, postID], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }

        callback(err, result);
    });
}

function selectPostByURL(connection, postURL, callback) {
    connection.query(query.selectByURL, [fields_teamblog, tables.teamblog, postURL], function (err, result) {
        if (err || !result) {
            return callback(err, {});
        }
        callback(err, result);
    })
}

function updatedTagList(connection, tagData, callback) {
    connection.query(query.selectByTag, [tables.teamblogTag, tagData.tag], function (error, rows) {
        if (!error && rows[0] && rows[0].id) {
            connection.query(query.updateCounterByTag, [tables.teamblogTag, 'tag_count', 'tag_count', tagData.tag], function (error, result) {
                callback(error, rows[0].id);
            });
        } else {
            connection.query(query.insertInto, [tables.teamblogTag, tagData], function (error, result) {
                callback(error, result.insertId);
            });
        }
    });
}

function insertTagRelatedPost(connection, tagRelatedPostData, callback) {
    connection.query(query.insertInto, [tables.teamblogTagRelated, tagRelatedPostData], function (error, result) {
        callback(error, result);
    });
}

function selectTags(connection, postData, callback) {
    connection.query(query.selectTagByPost, ['tag', 'tag_count', tables.teamblog, tables.teamblogTagRelated, tables.teamblogTag, postData.id], function (error, rows) {
        callback(error, rows);
    });
}

module.exports = {
    deleteScheme: deleteScheme,
    createScheme: createScheme,
    insertDummy: insertDummy,
    readTeamblogByPage: selectByPage,
    readTeamblogAllByTag: selectAllByTag,
    readTeamblogAllByMonth: selectAllByMonth,
    readTeamblogRecently: selectPostRecently,
    readTeamblogPinned: selectPostPinned,
    readPostByID: selectPostByID,
    readPostByURL: selectPostByURL,
    writePost: insertPost,
    updatePost: updatePost,
    readTags: selectTags,
    option: {
        tables: tables
    }
};
