var fs = require('fs');
var winston = require('winston');
// var Site = require('../../module/site/index');
// var Account = require('../../module/account/index');
// var Guestbook = require('../../module/guestbook/index');

var misc = require('../../core/lib/misc');
var routeTable = BLITITOR.route;

function testMiddleware1(req, res, next) {
    console.log('Route Middleware Test Method 1');
    next();
}

function testMiddleware2(req, res, next) {
    console.log('Route Middleware Test Method 2');
    next();
}

var Menu = [
    {
        name: '홈',
        page: 'index', type: 'get',
        middleware: [testMiddleware1, testMiddleware2],
        url: '/'
    },
    {
        name: '팀 블로그',
        url: routeTable.teamblog_root
    },
    {
        name: '방명록',
        url: routeTable.guestbook_root
    },
    {
        name: '소개',
        page: 'about', type: 'get',
        middleware: [],
        url: '/about'
    },
    {
        name: '새글쓰기',
        logged: 1,
        level: 2, grant: 'AMC',
        url: routeTable.teamblog_root + routeTable.teamblog.write
    },
    {
        name: '로그인',
        logged: -1,
        url: routeTable.account_root + routeTable.account.signIn
    },
    {
        name: '가입하기',
        logged: -1,
        url: routeTable.account_root + routeTable.account.signUp
    },
    {
        name: '로그아웃',
        logged: 1,
        url: routeTable.account_root + routeTable.account.signOut
    }
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