var fs = require('fs');
var path = require('path');
var async = require('neo-async');
var winston = require('winston');
var moment = require('moment');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var db = require('./database');

function noticeBoardList(req, res) {
    var params = {
        title: '공지사항',
        category: req.params['cate'] || req.query['cate'] || 1,
        page: Number(req.params['page'] || Number(req.query['p'] || 1)),
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readNoticeList(mysql, params, function (error, result) {
        if (error) {
            req.flash('error', { msg: '목록 읽기에 실패했습니다.' });

            winston.error(error);

            res.redirect('back');
        }

        result.noticeList.map(function (item) {
            item.nickname = item.nickname || '익명';
            item.created_at = !(item.created_at) ? '' : moment(item.created_at).fromNow();
            item.updated_at = !(item.updated_at) ? '' : moment(item.updated_at).fromNow();
        });

        params.pagination = result.pagination;
        params.noticeList = result.noticeList;

        res.render(BLITITOR.config.site.theme + '/page/notice/list', params);
    });
}

module.exports = {
    list: noticeBoardList,
};

