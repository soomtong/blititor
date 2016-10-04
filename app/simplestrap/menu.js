var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteTable();

var Menu = [
    {
        name: '홈',
        url: routeTable.root
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
        url: routeTable.about
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

var AdminMenu = {};
var ManagerMenu = {};

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;
