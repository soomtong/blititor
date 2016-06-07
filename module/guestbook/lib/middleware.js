function exposeLocals(req, res, next) {
    res.locals.user = req.user;
    res.locals.message = req.flash();

    next();
}

module.exports = {
    exposeLocals: exposeLocals
};