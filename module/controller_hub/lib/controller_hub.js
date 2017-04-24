var fs = require('fs');
var moment = require('moment');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');
var query = require('./query');

var routeData = require('../route.json');
var routeTable = misc.getRouteTable(routeData);
var controllerHubFlag = misc.commonFlag().controllerHub;

function gatewayList(req, res) {
    var params = {
        title: "넷 앱 컨트롤러 허브",
        pinnedNetAppCount: 4,
        pinnedNetAppList: [],
        recentNetAppCount: 8,
        recentNetAppList: [],
        categoryList: []
    };

    var mysql = connection.get();

    db.getGatewayGroupList(mysql, function (error, results) {
        params.groupList = results;
        db.getGatewayList(mysql, function (error, results) {
            results.map(function (item) {
                item.vmList = item.installed_apps && item.installed_apps.split(',').map(function (app) {
                        return app.trim();
                    }).filter(function (app) {
                        return !!app;
                    });
            });

            params.gatewayList = results;

            res.render(BLITITOR.config.site.theme + '/page/index', params);
        });
    });
}

function viewGateway(req, res) {
    var params = {
        title: '넷 앱 컨트롤러 허브',
        gateway: {}
    };

    res.render(BLITITOR.config.site.theme + '/page/gateway', params);
}

function gatewayForm(req, res) {
    var params = {
        title: '신규 게이트웨이 생성',
        groupList: []
    };

    var mysql = connection.get();

    db.getGatewayGroupList(mysql, function (error, results) {
        params.groupList = results;

        res.render(BLITITOR.config.site.theme + '/page/gateway_form', params);
    });
}

function newGateway(req, res) {
    req.assert('gateway_ip', 'gateway ip is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('group_id').escape();
    req.sanitize('description').escape();

    var gatewayData = {
        gateway_uuid: common.UUID1(),
        gateway_ip: req.body.gateway_ip,
        group_id: Number(req.body.group_id) || 0,
        secret_string: req.body.secret_string,
        created_at: new Date()
    };

    var mysql = connection.get();

    db.createGateway(mysql, gatewayData, function (error, result) {
        res.redirect(routeTable.controller_hub_root);
    });
}

function newGatewayGroup(req, res) {
    req.assert('group_title', 'title is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('group_title').escape();
    req.sanitize('group_subject').escape();
    req.sanitize('group_tag').escape();

    var gatewayGroupData = {
        flag: controllerHubFlag.gatewayGroup.normal,
        group_title: req.body.group_title,
        group_subject: req.body.group_subject,
        group_tag: req.body.group_tag,
        group_image: req.body.group_image || '//placeimg.com/50/50/' + common.randomNumber(1),
        created_at: new Date()
    };
    
    var mysql = connection.get();

    db.createGroup(mysql, gatewayGroupData, function (error, result) {
        res.redirect(routeTable.controller_hub_root);
    });
}

function saveGateway(req, res) {
    req.assert('group_title', 'title is required').notEmpty();
    req.assert('group_content', 'content is required').notEmpty();

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

    var mysql = connection.get();

    // save to guestbook table
/*
    db.uploadApp(mysql, appData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '새로운 넷 앱 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        var post_id = result['insertId'];

        winston.info('Saved app id', post_id);

        req.flash('info', 'Saved app by ' + (appData.nickname || appData.user_id));

        res.redirect(routeTable.account_root + routeTable.appstore.list);
    });
*/
}

module.exports = {
    index: gatewayList,
    gatewayForm: gatewayForm,
    view: viewGateway,
    newGateway: newGateway,
    newGatewayGroup: newGatewayGroup,
};
