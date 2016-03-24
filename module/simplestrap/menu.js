var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

var Menu = [
    {page: 'index', type: 'get', url: '/', middleware: [''], name: '홈'},
    {page: 'blog', type: 'get', url: '/blog', middleware: [''], name: '팀 블로그'},
    {page: 'guest', type: 'get', url: '/guest', middleware: [''], name: '방명록'},
    {page: 'about', type: 'get', url: '/about', middleware: [''], name: '소개'},
    {page: 'write', type: 'get', url: '/blog/write', middleware: [''], name: '새글쓰기', level: 1, grant: 'AMC'},
];

function menuExpose(req, res, next) {

    // var pages = BLITITOR.route.pages;
    // console.log('pages:', pages);

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = Menu;

    next();
}

function menuData() {
    return Menu;
}

module.exports = {
    expose: menuExpose,
    data: menuData
};