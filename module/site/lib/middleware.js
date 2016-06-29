function exposeLocals(req, res, next) {
    res.locals.user = req.user;
    res.locals.message = req.flash();

    console.log('bind locals middleware in site: {user, message}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};