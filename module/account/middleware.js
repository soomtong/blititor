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

module.exports = {
    checkSignedIn: ensureAuthenticated,
    checkLoggedSession: ensureClearSession
};