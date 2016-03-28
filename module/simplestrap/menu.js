var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

var Menu = [
    {page: 'index', type: 'get', url: '/', middleware: [''], name: '홈'},
    {page: 'blog', type: 'get', url: '/blog', middleware: [''], name: '팀 블로그'},
    {page: 'guest', type: 'get', url: '/guest', middleware: [''], name: '방명록'},
    {page: 'about', type: 'get', url: '/about', middleware: [''], name: '소개'},
    {page: 'write', type: 'get', url: '/blog/write', middleware: [''], name: '새글쓰기', logged: 1, level: 2, grant: 'AMC'},
    {page: 'sign_in', type: 'get', url: '/account/signin', middleware: [''], name: '로그인', logged: -1},
    {page: 'sign_up', type: 'get', url: '/account/signup', middleware: [''], name: '가입하기', logged: -1},
    {page: 'sign_out', type: 'get', url: '/account/signout', middleware: [''], name: '로그아웃', logged: 1},
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