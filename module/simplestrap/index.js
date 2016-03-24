var express = require('express');
//var winston = require('winston');

var middleware = require('../../core/middleware');

// load default modules
var page = require('./page');
var menu = require('./menu');

var router = express.Router();

var routeList = menu.data();

routeList.map(function (item) {
    console.log(router, page);
    router[item.type](item.url, page[item.page]);
});

module.exports = {
    router: router,
    menu: menu.exposeMenu
};