var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();

var Menu = [
    {
        id: 'index',
        name: 'KossLab Conference 2017',
        url: routeTable.root
    },
    {
        id: '2017home_preview',
        name: 'Home Preview',
        url: '/preview'
    },
    {
        id: 'conference_gallery',
        name: '갤러리',
        url: '/gallery'
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
        id: 'reservation',
        name: '예약자 명단',
        url: '/manage' + routeTable.manage.reservation
    },
    {
        id: 'tutorial',
        name: '튜토리얼 현황',
        url: '/manage' + routeTable.manage.tutorial
    },
    {
        id: 'gallery',
        name: '갤러리',
        url: '/manage' + routeTable.manage.gallery
    },
];

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;