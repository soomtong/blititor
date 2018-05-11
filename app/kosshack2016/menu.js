var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteData();
// var routeTable = require('../../core/config/route_default');
// or sometime need to make your own routeTable
// and update own route table

var Menu = [    // for plain page used by site.plain method (this page has each urls, not included modules)
    {
        id: 'index',
        name: 'KossLab Hackathon 2016',
        url: routeTable.root
    },
    {
        id: 'hackathon_gallery',
        name: '갤러리',
        url: '/gallery'
    },
    {
        id: 'volunteer_list',
        name: 'Volunteer List',
        url: '/volunteer'
    },
    {
        id: 'project_list',
        name: 'Project List',
        url: '/project'
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
        id: 'gallery',
        name: '갤러리',
        url: '/manage' + routeTable.manage.gallery
    },
    {
        id: 'guestbook',
        name: '방명록 관리',
        url: '/manage' + routeTable.guestbook_root
    }
];

module.exports = Menu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;