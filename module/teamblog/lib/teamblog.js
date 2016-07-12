var fs = require('fs');
var moment = require('moment');
var winston = require('winston');
var markdownIt = require('markdown-it');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var routeTable = BLITITOR.route;

var query = require('./query');

var db = require('./database');

function listPost(req, res) {
    var params = {
        title: '팀블로그',
        useMarkdown: true,
        page: Number(req.params['page'] || Number(req.query['p'] || 0))
    };

    var mysql = connection.get();
    var md = markdownIt({
        breaks: true,
        linkify: true,
        langPrefix: 'language-'
    });

    db.readTeamblog(mysql, Number(params.page), function (err, result) {
        if (err) {
            req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        // render markdown
        result.teamblogList.map(function (item) {   // this is sync process, it can be delayed
            item.post = md.render(item.post);
        });

        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.page = result.page;  // prevent when wrong page number assigned
        params.list = result.teamblogList;  // todo: convert markdown to html
        
        res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
    });
}

function writePost(req, res) {
    var params = {
        title: '팀블로그',
    };

    res.render(BLITITOR.config.site.theme + '/page/teamblog/write', params);
}


module.exports = {
    list: listPost,
    write: writePost
};