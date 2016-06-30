var winston = require('winston');

function exposeLocals(req, res, next) {
    // res.locals.user = req.user;  moved to site module

    winston.verbose('bind locals in guestbook: {}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};