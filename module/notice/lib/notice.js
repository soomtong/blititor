const fs = require('fs');
const path = require('path');
const async = require('neo-async');
const winston = require('winston');
const moment = require('moment');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const connection = require('../../../core/lib/connection');

const db = require('./database');

function noticeBoardList(req, res) {
    const params = {
        title: '공지사항',
        category: req.params['cate'] || req.query['cate'] || 1,
        page: Number(req.params['page'] || Number(req.query['p'] || 1)),
        xhr: req.xhr || false
    };

    const mysql = connection.get();

    db.readNoticeList(mysql, params, function (error, result) {
        if (error) {
            req.flash('error', { msg: '목록 읽기에 실패했습니다.' });

            winston.error(error);

            res.redirect('back');
        }

        result.noticeList.map(function (item) {
            item.nickname = item.nickname || '담당자';
            item.created_at = !(item.created_at) ? '' : moment(item.created_at).fromNow();
            item.updated_at = !(item.updated_at) ? '' : moment(item.updated_at).fromNow();
        });

        params.pagination = result.pagination;
        params.noticeList = result.noticeList;

        res.render(BLITITOR.site.theme + '/page/notice/list', params);
    });
}

function noticeManage(req, res) {
    const params = {
        title: '공지사항',
        category: req.params['cate'] || req.query['cate'] || 1,
        page: Number(req.params['page'] || Number(req.query['p'] || 1)),
        xhr: req.xhr || false
    };

    const mysql = connection.get();

    db.readNoticeList(mysql, params, function (error, result) {
        if (error) {
            req.flash('error', { msg: '목록 읽기에 실패했습니다.' });

            winston.error(error);

            res.redirect('back');
        }

        result.noticeList.map(function (item) {
            item.nickname = item.nickname || '담당자';
            item.created_at = !(item.created_at) ? '' : moment(item.created_at).fromNow();
            item.updated_at = !(item.updated_at) ? '' : moment(item.updated_at).fromNow();
        });

        params.pagination = result.pagination;
        params.noticeList = result.noticeList;

        res.render(BLITITOR.site.manageTheme + '/manage/notice', params);
    });
}

module.exports = {
    list: noticeBoardList,
    write: (req, res) => {
    },
    register: (req, res) => {
    },
    view: (req, res) => {
    },
    manage: noticeManage
};
