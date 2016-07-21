var fs = require('fs');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var routeTable = misc.getRouteTable();
// var routeTable = require('../../core/config/route_default');
// or sometime need to make your own routeTable
// and update own route table

var Menu = [
    {
        id: 'index',
        name: '홈',
        url: routeTable.root
    },
    {
        id: 'marketing',
        name: '마케팅',
        url: '/marketing'
    },
    {
        id: 'professional',
        name: '맴버',
        url: '/marketing/professional'
    },
    {
        id: 'about',
        name: '소개',
        url: routeTable.about
    }
];

function menuExpose(req, res, next) {

    // var pages = BLITITOR.route.pages;
    // console.log('pages:', pages);

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = Menu;

    next();
}

module.exports = Menu;
module.exports.expose = menuExpose;