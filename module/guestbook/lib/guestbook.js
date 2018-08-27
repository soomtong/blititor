var fs = require('fs');
var moment = require('moment');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var db = require('./database');

var routeTable = misc.getRouteData();

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

        res.render(BLITITOR.site.theme + '/page/guestbook/guestbook', params);
    });
}

// todo: experiment, bind ajax call and emit event
function registerMessage(req, res) {
    req.assert('account_id', '고유한 이메일 주소를 입력해주세요.').isEmail();
    req.assert('account_password', '패스워드는 4 자 이상으로 입력해주세요').len(4);
    // req.assert('phone_number', '정상적인 휴대폰 번호를 입력해주세요.').isMobilePhone('ko-KR');
    req.assert('phone_number', '정상적인 휴대폰 번호를 입력해주세요.').matches(/^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/);
    req.assert('message', '남기실 말씀은 10 자 이상으로 적어주세요.').len(10);

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('nickname').escape();
    req.sanitize('message').escape();

    var hash = common.hash(req.body.account_password);

    var guestbookData = {
        nickname: req.body.nickname,
        phone_number: req.body.phone_number,
        email: req.body.account_id,
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

        res.redirect(routeTable.guestbook.root);
    });
}

function updateReply(req, res) {
    req.assert('guestbook_id', 'id as message ID field is not valid').notEmpty().withMessage('Message ID is required');
    req.assert('reply', 'reply message is required').len(2).withMessage('Must be 2 chars over').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors);

        return res.redirect('back');
    }

    req.sanitize('guestbook_id').escape();
    req.sanitize('reply').escape();

    var replyData = {
        reply: req.body.reply,
        replied_at: new Date()
    };

    var mysql = connection.get();

    db.writeReply(mysql, req.body.guestbook_id, replyData, function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 저장에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        req.flash('info', 'Saved Reply by ' + (req.user.nickname || req.user.email));

        res.redirect(routeTable.guestbook.root);
    });
}

module.exports = {
    guestbook: guestbookForm,
    registerMessage: registerMessage,
    registerReply: updateReply
};