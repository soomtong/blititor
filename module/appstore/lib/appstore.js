var fs = require('fs');
var moment = require('moment');
var winston = require('winston');
var markdownIt = require('markdown-it');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');
var query = require('./query');

var routeData = require('../route.json');
var routeTable = misc.getRouteTable(routeData);
var appstoreFlag = misc.commonFlag().appStore;

function indexPage(req, res) {
    var params = {
        title: "넷 앱스토어",
        pinnedNetAppCount: 4,
        pinnedNetAppList: [],
        recentNetAppCount: 8,
        recentNetAppList: [],
        categoryList: []
    };

    categoryList(params, function (error, results) {
        if (!error) {
            params.categoryList = results;
        }

        pinnedNetApp(params, function (error, results) {
            if (!error) {
                params.pinnedNetAppList = results;
            }

            recentNetApp(params, function (error, results) {
                if (!error) {
                    params.recentNetAppList = results;
                }

                res.render(BLITITOR.config.site.theme + '/page/index', params);
            });
        });
    });
}

function listNetApp(req, res) {
    var params = {
        title: '넷앱 리스트',
        categoryList: [],
        page: Number(req.params['page'] || Number(req.query['p'] || 1))
    };

    var mysql = connection.get();

    db.readStoreAppByPage(mysql, params.page - 1, function (err, result) {
        if (err) {
            req.flash('error', {msg: '애플리케이션 목록 읽기에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        params.pagination = result.pagination;
        params.totalCount = result.total;
        params.list = result.storeAppList;

        res.render(BLITITOR.config.site.theme + '/page/app_list', params);
    });
}

function listNetAppByCategory(req, res) {
    var params = {
        title: '넷앱 리스트',
        categoryList: [],
        category: req.params['category'] || req.query['q'] || '',
        page: Number(req.params['page'] || Number(req.query['p'] || 1))
    };

    var mysql = connection.get();

    if (params.category) {
        categoryList(params, function (error, results) {
            if (!error) {
                params.categoryList = results;
            }

            db.readStoreAppListByCategory(mysql, params.category, params.page - 1, function (err, result) {
                if (err) {
                    req.flash('error', { msg: '애플리케이션 목록 읽기에 실패했습니다.' });

                    winston.error(err);

                    res.redirect('back');
                }

                params.pagination = result.pagination;
                params.totalCount = result.total;
                params.list = result.storeAppList;

                res.render(BLITITOR.config.site.theme + '/page/app_list', params);
            });
        });
    } else {
        res.redirect(routeTable.appstore_root + routeTable.appstore.list)
    }
}

function writeForm(req, res) {
    var params = {
        title: '넷 앱스토어',
    };

    res.render(BLITITOR.config.site.theme + '/page/teamblog/write', params);
}

function saveNetApp(req, res) {
    req.assert('content', 'content is required').len(10).withMessage('Must be 10 chars over').notEmpty();
    req.assert('title', 'title is required').notEmpty(10);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('title').escape();
    req.sanitize('tags').escape();

    var tagList = req.body.tags.split(',').map(function (tag) {
        return tag.trim();
    }).filter(function (tag) {
        return !!tag;
    });

    var postData = {
        user_uuid: req.user.uuid,
        user_id: req.user.id,
        nickname: req.user.nickname,
        flag: misc.setFlag(req.body.render),
        title: req.body.title,
        content: req.body.content,
        tags: tagList.join(','),
        created_at: new Date()
    };

    var mysql = connection.get();

    // save to guestbook table
    db.writePost(mysql, postData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '포스트 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        var post_id = result['insertId'];

        winston.info('Saved post id', post_id);

        req.flash('info', 'Saved Post by ' + (postData.nickname || postData.user_id));

        res.redirect(routeTable.teamblog_root + routeTable.teamblog.list);
    });
}

function viewNetApp(req, res) {
    var params = {
        title: '넷 앱스토어',
        appID: req.params['appNumber'],
        appURL: req.params['packageName']
    };

    if (!params.appID && !params.appURL) {
        return res.status(404).send('Not found');   // replace with html template
    }

    var mysql = connection.get();

    if (params.appID) {
        db.readAppByID(mysql, params.appID, function (err, result) {
            if (err || !result[0]) {
                req.flash('error', {msg: '넷 앱 정보 읽기에 실패했습니다.'});

                winston.error('can not read this app', err);

                return res.redirect('back');
            }

            params.app = renderPost(result[0]);

            return res.render(BLITITOR.config.site.theme + '/page/app_view', params);
        });
    }

    if (params.appURL) {
        db.readAppByPackageID(mysql, params.appURL, function (err, result) {
            if (err || !result[0]) {
                req.flash('error', {msg: '넷 앱 정보 읽기에 실패했습니다.'});

                winston.error('can not read this app', err);

                return res.redirect('back');
            }

            params.app = renderPost(result[0]);

            return res.render(BLITITOR.config.site.theme + '/page/app_view', params);
        });
    }
}

function categoryList(params, callback) {
    var mysql = connection.get();

    db.readCategories(mysql, function (err, result) {
        callback(err, result);
    });
}

function pinnedNetApp(params, callback) {
    var mysql = connection.get();

    db.readStoreAppPinned(mysql, params.pinnedNetAppCount, function (err, result) {
        callback(err, result);
    });
}

function recentNetApp(params, callback) {
    var mysql = connection.get();

    db.readStoreAppRecently(mysql, params.recentNetAppCount, function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    index: indexPage,
    list: listNetApp,
    listByCategory: listNetAppByCategory,
    write: writeForm,
    save: saveNetApp,
    view: viewNetApp,
    pinnedNetApp: pinnedNetApp,
    recentNetApp: recentNetApp
};

function renderPost(appInfo) {
    var p = appInfo;
    var md = new markdownIt();

    p.rendered = md.render(appInfo.content);

    var tagList = appInfo.tags.split(',').map(function (tag) {
        return tag.trim();
    }).filter(function (tag) {
        return !!tag;
    });

    p.tagList = tagList;

    return p;
}