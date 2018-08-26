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

function noticeManageHome(req, res) {
    const params = {
        title: '공지사항'
    };

    res.render(BLITITOR.site.manageTheme + '/manage/notice', params);
}

function noticeManage(req, res) {
    const params = {
        mode: req.body['mode'] || 'list',
        category: req.body['cate'] || req.body['c'] || 1,
        page: Number(req.body['page'] || Number(req.body['p'] || 1)),
        xhr: req.xhr || false
    };

    switch (params.mode) {
        case 'list':
            noticeList(params, (error, result) => {
                res.render(BLITITOR.site.manageTheme + '/manage/partial/notice_list', result);
            });

            break;
        case 'write':
            const noticeItem = {
                user_uuid: req.user.uuid,
                user_id: req.user.id,
                nickname: req.user.nickname,
                category: req.body['cate'] || req.body['c'] || 1,
                title: req.body['title'],
                body: req.body['body'],
                hit_count: 1,
                created_at: new Date(),
                updated_at: new Date()
            };

            params.noticeItem = noticeItem;

            noticeWrite(params, (error, result) => {
                res.render(BLITITOR.site.manageTheme + '/manage/partial/notice_list', result);
            });

            break;
        case 'delete':
            break;
    }
}

module.exports = {
    list: noticeBoardList,
    write: (req, res) => {
    },
    register: (req, res) => {
    },
    view: (req, res) => {
    },
    manageHome: noticeManageHome,
    manage: noticeManage
};

function noticeList(params, callback) {
    const mysql = connection.get();

    db.readNoticeList(mysql, params, function (error, result) {
        if (error) {
            winston.error('e' + error);
        }

        result.noticeList.map(function (item) {
            item.nickname = item.nickname || '담당자';
            item.createdAt = !(item.created_at) ? '' : moment(item.created_at).fromNow();
            item.updatedAt = !(item.updated_at) ? '' : moment(item.updated_at).fromNow();
        });

        params.pagination = result.pagination;
        params.noticeList = result.noticeList;

        callback(error, params)
    });
}

function noticeWrite(params, callback) {
    const mysql = connection.get();

    db.createNotice(mysql, params.noticeItem, function (error, result) {
        if (error) {
            winston.error(error);
        }

        winston.info('created new notice record id: ' + result.insertId);

        db.readNoticeList(mysql, params, function (error, result) {
            if (error) {
                winston.error('e' + error);
            }

            result.noticeList.map(function (item) {
                item.nickname = item.nickname || '담당자';
                item.createdAt = !(item.created_at) ? '' : moment(item.created_at).fromNow();
                item.updatedAt = !(item.updated_at) ? '' : moment(item.updated_at).fromNow();
            });

            params.pagination = result.pagination;
            params.noticeList = result.noticeList;

            callback(error, params)
        });
    });
}