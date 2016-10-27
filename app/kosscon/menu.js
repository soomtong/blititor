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
        id: '2016home_preview',
        name: 'Home Preview',
        url: '/preview'
    },
    {
        id: 'conference_program',
        name: 'Program',
        url: '/program'
    },
    {
        id: 'conference_keynote',
        name: 'Keynote',
        useSubPath: true,
        url: '/program/keynote'
    },
    {
        id: 'conference_presentation',
        name: 'Presentation',
        useSubPath: true,
        url: '/program/presentation'
    },
    {
        id: 'conference_tutorial',
        name: 'Tutorial',
        useSubPath: true,
        url: '/program/tutorial'
    },
    {
        id: 'register_form',
        name: 'Reservation Form',
        url: '/register'
    },
    {
        id: 'register_confirm',
        name: 'Reservation Confirm',
        useSubPath: true,
        url: '/register/confirm'
    },
    {
        id: 'edm_1',
        name: 'Direct Mail 1',
        useSubPath: true,
        url: '/register/dm1'
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
        useSubPath: true,
        url: '/2014/program'
    },
    {
        id: '2014info',
        name: 'KOSSCON 2014',
        useSubPath: true,
        url: '/2014/info'
    },
    {
        id: '2014registration',
        name: 'KOSSCON 2014',
        useSubPath: true,
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
        name: '예약자 명단',
        url: routeTable.manage_root + routeTable.manage.reservation
    },
    {
        id: 'tutorial',
        name: '튜토리얼 현황',
        url: routeTable.manage_root + routeTable.manage.tutorial
    }
];

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;