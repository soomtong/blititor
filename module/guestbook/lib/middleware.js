function exposeLocals(req, res, next) {
    // res.locals.user = req.user;  moved to site module

    console.log('bind locals middleware in guestbook: {user, message}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};