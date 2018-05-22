var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();
// var routeTable = require('../../core/config/route_default');
// or sometime need to make your own routeTable
// and update own route table

// static page menu describe here
// these links are not included modules route paths
var StaticMenu = [
    {
        id: 'post_new',
        name: '새글',
        logged: 1,
        level: 2, grant: 'AMC',
        url: '/blog' + routeTable.teamblog.write
    },
    {
        id: 'sign_in',
        name: '로그인',
        logged: -1,
        url: '/account' + routeTable.account.signIn
    },
    {
        id: 'sign_out',
        name: '로그아웃',
        logged: 1,
        url: '/account' + routeTable.account.signOut
    },
    {
        id: 'manage',
        name: '관리',
        logged: 1,
        level: 2, grant: 'AMC',
        url: '/manage'
    },
    {
        id: 'about',
        name: '소개',
        logged: -1,
        url: '/about'
    }
];

var AdminMenu = [
    {
        id: 'index',
        name: '관리자 홈',
        url: '/admin'
    },
    {
        id: 'new',
        name: '신규 계정 생성',
        url: '/admin' + routeTable.admin.accountNew
    },
    {
        id: 'manage',
        name: '운영',
        url: '/manage'
    }
];

var ManagerMenu = [
    {
        id: 'index',
        name: '운영자 홈',
        url: '/manage'
    },
    {
        id: 'account',
        name: '계정',
        url: '/manage' + routeTable.manage.account
    },
    {
        id: 'page_log',
        name: '페이지 로그',
        url: '/manage' + routeTable.manage.pageLog
    },
    {
        id: 'admin',
        name: '관리',
        url: '/admin'
    }
];

module.exports = StaticMenu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;