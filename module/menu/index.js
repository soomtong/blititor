var fs = require('fs');
var misc = require('../../lib/misc');
var knex = require('knex');
var winston = require('winston');

function menu(req, res, next) {

    var pages = BLITITOR.route.pages;

    //todo: retrieve from database site menu record which should match with `pages` items
    // read from database
    res.locals.menu = [{'menu1':'메뉴1'}, {'menu2':'메뉴2'}, {'menu3':'메뉴3'}];

    next();
}

module.exports = {
    exposeMenu: menu
};