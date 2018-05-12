var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();

var StaticMenu = [
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
        url: '/account' + routeTable.account.signIn
    },
    {
        name: '가입하기',
        logged: -1,
        url: '/account' + routeTable.account.signUp
    },
    {
        name: '로그아웃',
        logged: 1,
        url: '/account' + routeTable.account.signOut
    }
];

var AdminMenu = {};
var ManagerMenu = {};

module.exports = StaticMenu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;
