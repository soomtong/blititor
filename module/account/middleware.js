function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/account/sign-in');
}

module.exports = {
    checkSignedIn: ensureAuthenticated
};