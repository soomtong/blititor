var winston = require('winston');

var misc = require('../../../core/lib/misc');

var routeTable = misc.getRouteTable();

function exposeMenu(req, res, next) {

    next();
}

function exposeLocals(req, res, next) {
    // res.locals.user = req.user;  moved to site module

    winston.verbose('bind locals in counter: {}');
    next();
}

module.exports = {
    exposeMenu: exposeMenu,
    exposeLocals: exposeLocals
};