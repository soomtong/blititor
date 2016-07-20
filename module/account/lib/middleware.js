var winston = require('winston');

var misc = require('../../../core/lib/misc');

var userPrivilege = misc.getUserPrivilege();
var routeTable = misc.getRouteTable();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect(routeTable.account_root + routeTable.account.signIn);
}

function ensureClearSession(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }

    res.redirect(routeTable.account_root + routeTable.account.info);
}

function ensureAdminAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.grant.indexOf(userPrivilege.siteAdmin) > -1) {
        return next();
    }

    res.redirect(routeTable.admin_root + routeTable.admin.login);
}

function ensureManagerAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.grant.indexOf(userPrivilege.siteManager) > -1) {
        return next();
    }

    res.redirect(routeTable.manage_root + routeTable.manage.login);
}

function exposeLocals(req, res, next) {
    // res.locals.user = req.user;  moved to site module

    winston.verbose('bind locals in account: {}');
    next();
}

module.exports = {
    checkSignedIn: ensureAuthenticated,
    checkLoggedSession: ensureClearSession,
    checkAdministrator: ensureAdminAuthenticated,
    checkManager: ensureManagerAuthenticated,
    exposeLocals: exposeLocals
};