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

        pinnedApp(params, function (error, results) {
            if (!error) {
                params.pinnedNetAppList = results;
            }

            recentApp(params, function (error, results) {
                if (!error) {
                    params.recentNetAppList = results;
                }

                res.render(BLITITOR.config.site.theme + '/page/app_store/store_home', params);
            });
        });
    });
}

function listApps(req, res) {
    var params = {
        title: '넷앱 리스트',
        categoryList: [],
        page: Number(req.params['page'] || Number(req.query['p'] || 1))
    };

    var mysql = connection.get();

    db.readAppByPage(mysql, params.page - 1, function (err, result) {
        if (err) {
            req.flash('error', {msg: '애플리케이션 목록 읽기에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        params.pagination = result.pagination;
        params.totalCount = result.total;
        params.list = result.storeAppList;

        res.render(BLITITOR.config.site.theme + '/page/app_store/app_list', params);
    });
}

function listAppByCategory(req, res) {
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

            db.readAppListByCategory(mysql, params.category, params.page - 1, function (err, result) {
                if (err) {
                    req.flash('error', { msg: '애플리케이션 목록 읽기에 실패했습니다.' });

                    winston.error(err);

                    res.redirect('back');
                }

                params.pagination = result.pagination;
                params.totalCount = result.total;
                params.list = result.storeAppList;

                res.render(BLITITOR.config.site.theme + '/page/app_store/app_list', params);
            });
        });
    } else {
        res.redirect(routeTable.appstore_root + routeTable.appstore.list)
    }
}

function uploadForm(req, res) {
    var params = {
        title: '넷 앱스토어',
        categoryList: [],
        tagList: [],
    };

    categoryList(params, function (error, results) {
        if (!error) {
            params.categoryList = results;
        }

        tagList(params, function (error, results) {
            var tags = [];
            if (!error) {
                results.map(function (item) {
                    tags = tags.concat(item.tags.split(',').map(function (tag) {
                        return tag.trim();
                    }).filter(function (item) {
                        return item;
                    }));
                });

                params.tagList = tags;
            }

            res.render(BLITITOR.config.site.theme + '/page/app_store/app_upload', params);
        });
    });
}

function saveApp(req, res) {
    req.assert('app_title', 'title is required').notEmpty();
    req.assert('app_content', 'content is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('app_title').escape();
    req.sanitize('app_tags').escape();

    var tagList = common.splitString2Array(req.body.tags, ',');

    var appData = {
        user_uuid: req.user.uuid,
        user_id: req.user.id,
        nickname: req.user.nickname,
        download_url: req.body.download_url,
        package_id: req.body.package_id,
        version: '1.0',
        title: req.body.app_title,
        description: req.body.app_description,
        price: req.body.app_price,
        price_for_sale: req.body.app_price_for_sale,
        category_id: req.body.app_category || 0,
        content: req.body.content,
        tags: tagList.join(','),
        created_at: new Date()
    };

    console.log(appData, req.body);

    var mysql = connection.get();

    // save to guestbook table
    db.uploadApp(mysql, appData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '새로운 넷 앱 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        var post_id = result['insertId'];

        winston.info('Saved app id', post_id);

        req.flash('info', 'Saved app by ' + (appData.nickname || appData.user_id));

        res.redirect('/account' + routeTable.appstore.list);
    });
}

function viewApp(req, res) {
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

            if (req.user && req.user.uuid) {
                db.readOrderByID(mysql, params.appID, req.user.uuid, function (error, results) {
                    if (results && results.length && results[0].user_uuid === req.user.uuid) {
                        params.orderInfo = results[0];

                        return res.render(BLITITOR.config.site.theme + '/page/app_store/app_view', params);
                    } else {
                        return res.render(BLITITOR.config.site.theme + '/page/app_store/app_view', params);
                    }
                });
            } else {
                return res.render(BLITITOR.config.site.theme + '/page/app_store/app_view', params);
            }
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

            return res.render(BLITITOR.config.site.theme + '/page/app_store/app_view', params);
        });
    }
}

function orderApp(req, res) {
    var params = {
        title: '넷 앱스토어',
        appID: req.params['appNumber'],
        appURL: req.params['packageName']
    };

    if (!params.appID && !params.appURL) {
        return res.status(404).send('Not found');   // replace with html template
    }

    var mysql = connection.get();

    var orderData = {
        store_app_id: params.appID,
        user_uuid: req.user.uuid,
        user_id: req.user.id,
        status: appstoreFlag.ordered,
        created_at: new Date()
    };

    db.orderAppByID(mysql, orderData, function (err, result) {
        if (!err) {
            res.send({ status: 'success', data: {
                    insertId: result.insertId }
            });
        } else {
            res.send({ status: 'error', data: {
                error: err }
            });
        }
    });
}

function purchasedAppList(req, res) {
    var params = {
        title: '구입 목록',
        appList: []
    };

    var mysql = connection.get();

    var userData = {
        uuid: req.user.uuid,
        id: req.user.id
    };

    db.orderedAppList(mysql, userData.uuid, function (error, results) {
        if (!error && results.length) {
            results.map(function (item) {
                item.purchased_at = common.dateFormatter(item.purchased_at, "YYYY-MM-DD HH:mm");
                item.installed_at = common.dateFormatter(item.installed_at, "YYYY-MM-DD HH:mm");
            });

            params.appList = results;
        }

        res.render(BLITITOR.config.site.theme + '/page/account/purchased_list', params);
    })
}

module.exports = {
    index: indexPage,
    list: listApps,
    listByCategory: listAppByCategory,
    upload: uploadForm,
    save: saveApp,
    view: viewApp,
    order: orderApp,
    purchasedAppList: purchasedAppList
};

function recentApp(params, callback) {
    var mysql = connection.get();

    db.readAppRecently(mysql, params.recentNetAppCount, function (err, result) {
        callback(err, result);
    });
}

function pinnedApp(params, callback) {
    var mysql = connection.get();

    db.readAppPinned(mysql, params.pinnedNetAppCount, function (err, result) {
        callback(err, result);
    });
}

function categoryList(params, callback) {
    var mysql = connection.get();

    db.readCategories(mysql, function (err, result) {
        callback(err, result);
    });
}

function tagList(params, callback) {
    var mysql = connection.get();

    db.readTags(mysql, function (err, result) {
        callback(err, result);
    });
}

function renderPost(appInfo) {
    var p = appInfo;
    var md = new markdownIt();

    p.rendered = md.render(appInfo.content);

    p.tagList = appInfo.tags.split(',').map(function (tag) {
        return tag.trim();
    }).filter(function (tag) {
        return !!tag;
    });

    return p;
}