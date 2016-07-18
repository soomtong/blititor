var fs = require('fs');
var winston = require('winston');

var routeTable = BLITITOR.route;

var Menu = [
    {
        name: '홈',
        url: routeTable.root
    },
    {
        name: '마케팅',
        url: '/marketing'
    },
    {
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