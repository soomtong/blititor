var fs = require('fs');
var moment = require('moment');
var winston = require('winston');
var markdownIt = require('markdown-it');
var quillRender = require('quilljs-renderer');
var striptags = require('striptags');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');
var query = require('./query');

var routeTable = misc.getRouteTable();
var postFlag = misc.commonFlag().post;

function indexPage(req, res) {
    var params = {
        title: "Home",
        pinnedPostCount: 2,
        pinnedPostList: [],
        recentPostCount: 8,
        recentPostList: []
    };

    pinnedPost(params, function (error, results) {
        if (!error) {
            params.pinnedPostList = results;
            params.pinnedPostList.map(makePreviewContent);
        }

        recentPost(params, function (error, results) {
            if (!error) {
                params.recentPostList = results;
                params.recentPostList.map(makePreviewContent);
            }

            res.render(BLITITOR.config.site.theme + '/page/index', params);
        });
    });
}

function listPost(req, res) {
    var params = {
        title: '팀블로그',
        useMarkdown: true,
        tag: req.params['tag'],
        page: Number(req.params['page'] || Number(req.query['p'] || 1)),
        month: req.params['month'],
        year: req.params['month'] ? req.params['year'] : undefined
    };

    var mysql = connection.get();

    var defaultYear = moment().format('YYYY');
    var defaultMonth = moment().format('MM');

    if (Number(params.year) < 1000 || Number(params.year) > 3000) params.year = defaultYear;
    if (Number(params.month) < 0 || Number(params.month) > 12) params.month = defaultMonth;

    if (params.month) {
        db.readTeamblogAllByMonth(mysql, params.year, params.month, function (err, result) {
            if (err) {
                req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            result.teamblogList.map(makePreviewContent);

            params.count = result.teamblogList.length;
            params.list = result.teamblogList;  // todo: convert markdown to html
            params.monthlyList = result.postGroupList;  // todo: convert markdown to html

            res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
        });
    } else if (params.tag) {
        db.readTeamblogAllByTag(mysql, params.tag.trim(), function (err, result) {
            if (err) {
                req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            result.teamblogList.map(makePreviewContent);

            params.count = result.teamblogList.length;
            params.list = result.teamblogList;  // todo: convert markdown to html
            params.monthlyList = result.postGroupList;  // todo: convert markdown to html

            res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
        });
    } else {
        db.readTeamblogByPage(mysql, params.page - 1, function (err, result) {
            if (err) {
                req.flash('error', {msg: '블로그 정보 읽기에 실패했습니다.'});

                winston.error(err);

                res.redirect('back');
            }

            // render content and this is sync process, it can be delayed
            result.teamblogList.map(makePreviewContent);

            params.pagination = true;
            params.totalCount = result.total;
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

function viewPost(req, res) {
    var params = {
        title: '팀블로그',
        postID: req.params['postNumber'],
        postURL: req.params['postTitle'],
    };

    if (!params.postID && !params.postURL) {
        return res.status(404).send('Not found');   // replace with html template
    }

    var mysql = connection.get();

    if (params.postID) {
        db.readPostByID(mysql, params.postID, function (err, result) {
            if (err || !result[0]) {
                req.flash('error', {msg: '포스트 읽기에 실패했습니다.'});

                winston.error('can not read this post', err);

                return res.redirect('back');
            }

            params.post = renderPost(result[0]);

            return res.render(BLITITOR.config.site.theme + '/page/teamblog/view', params);
        });
    }

    if (params.postURL) {
        db.readPostByURL(mysql, params.postURL, function (err, result) {
            if (err || !result[0]) {
                req.flash('error', {msg: '포스트 읽기에 실패했습니다.'});

                winston.error('can not read this post', err);

                return res.redirect('back');
            }

            params.post = renderPost(result[0]);

            return res.render(BLITITOR.config.site.theme + '/page/teamblog/view', params);
        });
    }
}

// used outside of this module, just export them
function recentPost(params, callback) {
    var mysql = connection.get();

    db.readTeamblogRecently(mysql, params.recentPostCount, function (err, result) {
        callback(err, result);
    });
}

function pinnedPost(params, callback) {
    var mysql = connection.get();

    db.readTeamblogPinned(mysql, params.pinnedPostCount, function (err, result) {
        callback(err, result);
    });
}

module.exports = {
    index: indexPage,
    list: listPost,
    write: writeForm,
    save: savePost,
    view: viewPost,
    pinnedPost: pinnedPost,
    recentPost: recentPost
};

function makePreviewContent (item) {   // this is sync process, it can be delayed
    var previewLen = 200;
    if (item.created_at) {
        item.created_at = moment(item.created_at).fromNow()
    }
    if (item.updated_at) {
        item.updated_at = moment(item.updated_at).fromNow()
    }
    if (item.tags) {
        item.tags = item.tags.split(',').map(function (tag) {
            return tag.trim();
        });
    }

    if (item.flag && (item.flag.toString().includes(postFlag.headedPicture.value))) {
        item.headedPicture = true;
        item.images = JSON.parse(item['header_imgs']);
    } else {
        if (item.flag && (item.flag.toString().includes(postFlag.markdown.value))) {
            item.preview = common.getHeaderTextFromMarkdown(item['content'], previewLen, '<br>');
        } else if (item.flag && (item.flag.toString().includes(postFlag.delta.value))) {
            item.preview = common.getHeaderTextFromDelta(item['content'], previewLen, '<br>');
        } else {
            item.preview = common.getHeaderTextFromMarkdown(striptags(item['content'],['br']).replace(/<br>/gm, '\n'), previewLen, '<br>');
        }
    }
}

function renderPost(post) {
    var p = post;
    var md = new markdownIt();

    p.tagList = post.tags.split(',').filter(function (item) {
        return item;
    });
    p.renderMarkdown = post.flag.includes(postFlag.markdown.value);
    p.renderDelta = post.flag.includes(postFlag.delta.value);

    if (p.renderMarkdown) {
        p.rendered = md.render(post.content);
    }

    if (p.renderDelta) {
        quillRender.loadFormat('html');
        p.rendered = new quillRender.Document(JSON.parse(post.content)).convertTo('html');
    }

    return p;
}