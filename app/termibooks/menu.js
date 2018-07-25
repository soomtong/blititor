var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();
// var routeTable = require('../../core/config/route_default');
// or sometime need to make your own routeTable
// and update own route table

var StaticMenu = [
    {
        id: 'index',
        name: '처음',
        logged: -1,
        url: routeTable.root
    },
    {
        id: 'library',
        name: '출간서',
        logged: -1,
        url: '/library'
    },
    {
        id: 'qna',
        name: '문의사항',
        logged: 1,
        url: '/qna'
    },
    {
        id: 'about',
        name: '출판사 소개',
        url: '/about'
    },
    {
        id: 'privacy',
        name: '개인정보 보호정책',
        url: '/privacy'
    }
];

var AdminMenu = [
    {
        id: 'index',
        name: '관리자 홈',
        url: routeTable.admin.root
    },
    {
        id: 'new',
        name: '신규 계정 생성',
        url: routeTable.admin.root + routeTable.admin.accountNew
    },
    {
        id: 'manage',
        name: '운영',
        url: routeTable.manage.root
    }
];

var ManagerMenu = [
    {
        id: 'index',
        name: '운영자 홈',
        url: routeTable.manage.root
    },
    {
        id: 'account',
        name: '계정',
        url: routeTable.manage.root + routeTable.manage.account
    },
    {
        id: 'page_log',
        name: '페이지 로그',
        url: routeTable.manage.root + routeTable.manage.pageLog
    },
    {
        id: 'admin',
        name: '관리',
        url: routeTable.admin.root
    }
];

module.exports = StaticMenu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;
