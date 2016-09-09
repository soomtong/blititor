var fs = require('fs');
var moment = require('moment');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');
var query = require('./query');

var routeTable = misc.getRouteTable();

// todo: experiment, receive ws push in a guestbook page
// todo: ajax load version when receive query param in page number (like ?p=10)
function guestbookForm(req, res) {
    var params = {
        title: '방명록',
        page: Number(req.params['page'] || Number(req.query['p'] || 0))
    };

    var mysql = connection.get();
    
    db.readGuestbook(mysql, Number(params.page), function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 읽기에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.page = result.page;  // prevent when wrong page number assigned

        result.guestbookList.map(function (item) {
            item.nickname = item.nickname || '익명';
            item.created_at = !(item.created_at) ? '' : moment(item.created_at).fromNow();
            item.replied_at = !(item.replied_at) ? '' : moment(item.replied_at).fromNow();
        });

        params.list = result.guestbookList;

        res.render(BLITITOR.config.site.theme + '/page/guestbook/guestbook', params);
    });
}

// todo: experiment, bind ajax call and emit event
function registerMessage(req, res) {
    req.assert('email', 'Email as User ID field is not valid').notEmpty().withMessage('User ID is required').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('message', 'message is required').len(10).withMessage('Must be 10 chars over').notEmpty();
    
    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    req.sanitize('message').escape();

    var hash = common.hash(req.body.password);

    var guestbookData = {
        nickname: req.body.nickname,
        email: req.body.email,
        password: hash,
        message: req.body.message,
        flag: req.body.hidden ? '1' : '',  // todo: subtract common flag module using bitwise
        created_at: new Date()
    };

    var mysql = connection.get();

    // save to guestbook table
    db.writeMessage(mysql, guestbookData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        var guestbook_id = result['insertId'];
        winston.info('Saved guestbook id', guestbook_id);

        req.flash('info', 'Saved Guestbook by ' + (guestbookData.nickname || guestbookData.email));

        res.redirect(routeTable.guestbook_root);
    });
}

function updateReply(req, res) {
    req.assert('id', 'id as message ID field is not valid').notEmpty().withMessage('Message ID is required');
    req.assert('reply', 'reply message is required').len(2).withMessage('Must be 2 chars over').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('id').escape();
    req.sanitize('reply').escape();

    var replyData = {
        reply: req.body.reply,
        replied_at: new Date()
    };

    var mysql = connection.get();

    db.writeReply(mysql, req.body.id, replyData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        console.log(result);
        
        req.flash('info', 'Saved Reply by ' + (req.user.nickname || req.user.email));

        res.redirect(routeTable.guestbook_root);
    });
}

module.exports = {
    guestbook: guestbookForm,
    registerMessage: registerMessage,
    registerReply: updateReply
};