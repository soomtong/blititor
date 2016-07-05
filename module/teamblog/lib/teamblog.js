var fs = require('fs');
var moment = require('moment');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

var routeTable = BLITITOR.route;

// var query = require('./query');

// var db = require('./database');


// todo: experiment, receive ws push in a guestbook page
// todo: ajax load version when receive query param in page number (like ?p=10)
function blogList(req, res) {
    var params = {
        title: '팀블로그',
        page: Number(req.params['page'] || Number(req.query['p'] || 0))
    };

    // var mysql = connection.get();

/*
    db.readGuestbook(mysql, Number(params.page), function (err, result) {
        if (err) {
            req.flash('error', {msg: '방명록 정보 읽기에 실패했습니다.'});

            winston.error(err);

            res.redirect('back');
        }

        params.hasNext = result.total > (result.page + 1) * result.pageSize;
        params.hasPrev = result.page > 0;
        params.page = result.page;  // prevent when wrong page number assigned
        params.list = result.guestbookList;

        res.render(BLITITOR.config.site.theme + '/page/guestbook/guestbook', params);
    });
*/
    res.render(BLITITOR.config.site.theme + '/page/teamblog/list', params);
}


module.exports = {
    list: blogList
};