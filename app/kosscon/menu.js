var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteTable();

var Menu = [
    {
        id: 'index',
        name: 'KossLab Conference 2016',
        url: routeTable.root
    },
    {
        id: 'conference_program',
        name: 'Program',
        url: '/program'
    },
    {
        id: 'reservation_list',
        name: 'Reservation List',
        url: '/reservation'
    },
    {
        id: '2015index',
        name: 'KOSSCON 2015',
        url: '/2015'
    },
    {
        id: '2014index',
        name: 'KOSSCON 2014',
        url: '/2014'
    },
    {
        id: '2014program',
        name: 'KOSSCON 2014',
        url: '/2014/program'
    },
    {
        id: '2014info',
        name: 'KOSSCON 2014',
        url: '/2014/info'
    },
    {
        id: '2014registration',
        name: 'KOSSCON 2014',
        url: '/2014/registration'
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
        id: 'reservation',
        name: '등록자 명단',
        url: routeTable.manage_root + routeTable.manage.reservation
    }
];

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;