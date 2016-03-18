var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

function menu(req, res, next) {

    var pages = BLITITOR.route.pages;
    console.log('pages:', pages);

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = [
        {page: 'index', url: '/', name: '홈'},
        {page: 'blog', url: '/blog', name: '블로그'},
        {page: 'guest', url: '/guest', name: '방명록'},
        {page: 'about', url: '/about', name: '소개'},
        {page: 'write', url: '/blog/write', name: '새글쓰기', level: 1, grant: 'AMC'},
    ];

    next();
}

module.exports = {
    exposeMenu: menu
};