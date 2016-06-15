function exposeLocals(req, res, next) {
    res.locals.message = req.flash();

    next();
}

module.exports = {
    exposeLocals: exposeLocals
};