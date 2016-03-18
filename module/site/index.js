var fs = require('fs');
var knex = require('knex');
var winston = require('winston');

var menu = require('./menu');

function index(req, res) {
    var params = {
        title: "Home"
    };

    //500 Error
    //throw Error('make noise!');

    // load recent articles

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

function pages(req, res) {
    var params = {
        title: "Home",
        page: req.path
    };

    console.log(res.locals.menu, req.path);

    var isPage = req.path.indexOf('/') == 0 && req.path.length > 1;

    if (isPage) {
        res.render(BLITITOR.config.site.theme + '/page' + req.path, params);
    } else {
        res.render(BLITITOR.config.site.theme + '/page/index', params);
    }
}

module.exports = {
    //index: pages,
    pages: pages,
    exposeMenu: menu.exposeMenu
};