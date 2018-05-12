var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();
// var routeTable = require('../../core/config/route_default');
// or sometime need to make your own routeTable
// and update own route table

var StaticMenu = [
    {
        id: 'index',
        name: '홈',
        logged: -1,
        url: routeTable.root
    },
    {
        id: 'marketing',
        name: '마케팅',
        logged: -1,
        url: '/marketing'
    },
    {
        id: 'chatting',
        name: '채팅',
        logged: 1,
        url: '/chat' + routeTable.chat.form
    },
    {
        id: 'professional',
        name: '맴버',
        logged: -1,
        url: '/marketing/professional'
    },
    {
        id: 'about',
        name: '소개',
        logged: -1,
        url: routeTable.about
    },
    {
        id: 'login',
        name: '로그인',
        logged: -1,
        url: '/account' + routeTable.account.signIn
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
