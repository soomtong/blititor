function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/account/sign-in');
}

function ensureClearSession(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }

    res.redirect('/account/info');
}

function exposeLocals(req, res, next) {
    res.locals.user = req.user;
    res.locals.message = req.flash();

    next();
}

module.exports = {
    checkSignedIn: ensureAuthenticated,
    checkLoggedSession: ensureClearSession,
    exposeLocals: exposeLocals
};