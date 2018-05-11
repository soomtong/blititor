var winston = require('winston');

var misc = require('../../../core/lib/misc');
var databaseDefault = misc.getDatabaseDefault();
var routeTable = misc.getRouteData();

function exposeMenu(req, res, next) {
    // it can be bound correctly, app/route's expose menu called at core stage
    res.locals.menu.manage_root = '/manage';

    next();
}

function exposeLocals(req, res, next) {
    // res.locals.user = req.user;  moved to site module

    winston.verbose('bind locals in administrator: {}');
    next();
}

module.exports = {
    exposeMenu: exposeMenu,
    exposeLocals: exposeLocals
};