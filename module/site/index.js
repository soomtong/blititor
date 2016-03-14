var fs = require('fs');
var misc = require('../../lib/misc');
var knex = require('knex');
var winston = require('winston');

function index(req, res) {
    var params = {
        title: "Home"
    };

    // load recent articles

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

function pages(req, res) {
    var params = {
        page: req.path
    };

    console.log(req.path);

    if (false || isPage) {
        res.render(BLITITOR.config.site.theme + '/page' + req.path, params);
    } else {
        res.render(BLITITOR.config.site.theme + '/page/index', params);
    }
}

function notExist(req, res) {
    //res.sendStatus(404);

    var params = {
        title: "Home"
    };

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

module.exports = {
    index: index,
    pages: pages,
    notExist: notExist
};