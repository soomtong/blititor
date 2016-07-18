var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

var menu = require('./menu');

// custom middleware

// load modules for router
var Site = require('../../module/site');
var Account = require('../../module/account');  // mandatory for session system
var bindRouter = function () {
    menu.map(function (item) {
        router[item.type || 'get'](item.url, Site.plain);
    });
};
// bind static page
bindRouter();

module.exports = router;
