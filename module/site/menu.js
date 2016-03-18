var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

function menu(req, res, next) {

    var pages = BLITITOR.route.pages;

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = [
        { url: '/', name: '홈' },
        { url: '/blog', name: '블로그' },
        { url: '/write', name: '새글쓰기', level: 1, grant: 'AMC' },
        { url: '/guest', name: '방명록' },
        { url: '/about', name: '소개' }
    ];

    next();
}

module.exports = {
    exposeMenu: menu
};