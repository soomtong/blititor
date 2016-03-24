var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

var Menu = [
    {page: 'index', type: 'get', url: '/', name: '홈'},
    {page: 'blog', type: 'get', url: '/blog', name: '팀 블로그'},
    {page: 'guest', type: 'get', url: '/guest', name: '방명록'},
    {page: 'about', type: 'get', url: '/about', name: '소개'},
    {page: 'write', type: 'get', url: '/blog/write', name: '새글쓰기', level: 1, grant: 'AMC'},
];

function menu(req, res, next) {

    var pages = BLITITOR.route.pages;
    console.log('pages:', pages);

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = Menu;

    next();
}

function menuData() {
    return Menu;
}

module.exports = {
    exposeMenu: menu,
    data: menuData
};