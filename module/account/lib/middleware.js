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
    // res.locals.user = req.user;  moved to site module

    console.log('bind locals middleware in account: {}');
    next();
}

module.exports = {
    checkSignedIn: ensureAuthenticated,
    checkLoggedSession: ensureClearSession,
    exposeLocals: exposeLocals
};