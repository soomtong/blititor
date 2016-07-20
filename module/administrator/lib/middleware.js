var winston = require('winston');

var misc = require('../../../core/lib/misc');

var routeTable = misc.getRouteTable();

function exposeMenu(req, res, next) {
    res.locals.adminMenu = {
        root: routeTable.admin_root
    };

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