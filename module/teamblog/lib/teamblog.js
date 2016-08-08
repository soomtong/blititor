var fs = require('fs');
var moment = require('moment');
var winston = require('winston');
var markdownIt = require('markdown-it');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');
var query = require('./query');

var routeTable = misc.getRouteTable();

function listPost(req, res) {
    var params = {
        title: '팀블로그',
        useMarkdown: true,
        page: Number(req.params['page'] || Number(req.query['p'] || 1)),
        month: req.params['month'],
        year: req.params['month'] ? req.params['year'] : undefined
    };

    var mysql = connection.get();
    var md = markdownIt({
        breaks: true,
        linkify: true,
        langPrefix: 'language-'
    });

    if (params.month) {
        db.readTeamblogAll(mysql, Number(params.year), Number(params.month), function (err, result) {
            if (err) {
                req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            // render markdown
            result.teamblogList.map(function (item) {   // this is sync process, it can be delayed
                item.content = md.render(item.content);
            });

            params.list = result.teamblogList;  // todo: convert markdown to html
            params.monthlyList = result.postGroupList;  // todo: convert markdown to html

            res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
        });
    } else {
        db.readTeamblogByPage(mysql, Number(params.page - 1), function (err, result) {
            if (err) {
                req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            // render markdown
            result.teamblogList.map(function (item) {   // this is sync process, it can be delayed
                item.content = md.render(item.content);
            });

            params.pagination = true;
            params.hasNext = result.total > (result.page + 1) * result.pageSize;
            params.hasPrev = result.page > 0;
            params.maxPage = result.maxPage + 1;
            params.page = result.page + 1;  // prevent when wrong page number assigned
            params.list = result.teamblogList;  // todo: convert markdown to html
            params.monthlyList = result.postGroupList;  // todo: convert markdown to html

            res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
        });
    }
}

function writeForm(req, res) {
    var params = {
        title: '팀블로그',
    };

    res.render(BLITITOR.config.site.theme + '/page/teamblog/write', params);
}

function savePost(req, res) {


    res.redirect(routeTable.teamblog_root + routeTable.teamblog.list);
}

function viewPost(req, res) {
    console.log(req.params);
    res.send('hi');
}

// used outside of this module, just export them
function recentPost(params, callback) {
    var mysql = connection.get();

    db.readTeamblogRecently(mysql, params.recentPostCount, function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    list: listPost,
    write: writeForm,
    save: savePost,
    view: viewPost,
    recentPost: recentPost
};