var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();

var SiteMenu = [
    {
        id: 'index',
        name: '홈',
        url: routeTable.root
    },
    {
        id: 'blog',
        name: '팀 블로그',
        url: '/blog'
    },
    {
        id: 'guestbook',
        name: '방명록',
        url: '/guest'
    },
    {
        id: 'about',
        name: '소개',
        url: '/about'
    },
    {
        name: '새글쓰기',
        logged: 1,
        level: 2, grant: 'AMC',
        url: '/blog/write'
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
var ManageMenu = {};

module.exports = {
    SiteMenu: SiteMenu,
    AdminMenu: AdminMenu,
    ManageMenu: ManageMenu,
};