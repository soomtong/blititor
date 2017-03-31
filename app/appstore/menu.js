var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteTable();
// or sometime need to make your own routeTable
// and update own route table
// like below
// var routeData = require('./route.json');
// var routeTable = misc.getRouteTable(routeData);

var Menu = [
    {
        id: 'about',
        name: '소개',
        logged: -1,
        url: routeTable.about
    },
    {
        id: 'sign_in',
        name: '로그인',
        logged: -1,
        url: routeTable.account_root + routeTable.account.signIn
    },
    {
        id: 'sign_out',
        name: '로그아웃',
        logged: 1,
        url: routeTable.account_root + routeTable.account.signOut
    },
    {
        id: 'manage',
        name: '관리',
        logged: 1,
        level: 2, grant: 'AMC',
        url: routeTable.manage_root
    }
];

var AdminMenu = [
    {
        id: 'index',
        name: '관리자 홈',
        url: routeTable.admin_root
    },
    {
        id: 'new',
        name: '신규 계정 생성',
        url: routeTable.admin_root + routeTable.admin.accountNew
    },
    {
        id: 'manage',
        name: '운영',
        url: routeTable.manage_root
    }
];

var ManagerMenu = [
    {
        id: 'index',
        name: '운영자 홈',
        url: routeTable.manage_root
    },
    {
        id: 'account',
        name: '계정',
        url: routeTable.manage_root + routeTable.manage.account
    },
    {
        id: 'page_log',
        name: '페이지 로그',
        url: routeTable.manage_root + routeTable.manage.pageLog
    },
    {
        id: 'admin',
        name: '관리',
        url: routeTable.admin_root
    }
];

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;