var winston = require('winston');

var misc = require('../../../core/lib/misc');

var userPrivilege = misc.getUserPrivilege();
var routeTable = misc.getRouteData();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect(BLITITOR.config.site.service.url_prefix + '/account' + routeTable.account.signIn);
}

function ensureClearSession(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }

    res.redirect(BLITITOR.config.site.service.url_prefix + '/account' + routeTable.account.info);
}

function ensureAdminAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.grant.includes(userPrivilege.siteAdmin)) {
        return next();
    }

    res.redirect(BLITITOR.config.site.service.url_prefix + '/admin' + routeTable.admin.login);
}

function ensureManagerAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.grant.includes(userPrivilege.siteManager)) {
        return next();
    }

    res.redirect(BLITITOR.config.site.service.url_prefix + '/manage' + routeTable.manage.login);
}

function exposeLocals(req, res, next) {
    res.locals.user = req.user;

    winston.verbose('bind locals in account: {user}');
    next();
}

module.exports = {
    checkSignedIn: ensureAuthenticated,
    checkLoggedSession: ensureClearSession,
    checkAdministrator: ensureAdminAuthenticated,
    checkManager: ensureManagerAuthenticated,
    exposeLocals: exposeLocals
};